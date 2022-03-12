import {Command} from 'commander/esm.mjs';
import {promises as fs} from 'fs';
import {marked} from 'marked';
import YAML from 'yaml';
import generate from '@babel/generator';
import * as t from '@babel/types';
import template from '@babel/template';
import {header, innerDescribe} from './templateFragement.mjs';

const cli = new Command();

/**
 * List all file paths according to cli options
 * @param opts
 * @returns {Promise<*[]>}
 */
const fileHelper = async (opts) => {
  /**
   * Consume opts to determine scope of processing,
   * and delete old generated files (note that add files to auto-gen dirs is allowed and shouldn't be deleted)
   */
  let todolist = [];

  let propertyProxy =
    Object.keys(opts).length === 0 ? ['entity', 'relation'] : Object.keys(opts);

  for (const property of propertyProxy) {
    let optionProxy = [];

    if (!opts[property] || opts[property] === true) {
      try {
        optionProxy = await fs.readdir(`docs/${property}`);
      } catch (e) {
      }
    } else {
      try {
        optionProxy = opts[property].map(item => `${item}.md`);
      } catch (e) {
      }
    }

    todolist.push(...optionProxy.map(item => `docs/${property}/${item}`));
  }

  return todolist;
};

/**
 * Remove old generated files in a given folder,
 * create if it does not exist.
 * @param dirName
 * @returns {Promise<void>}
 */
const setupDir = async (dirName) => {
  // Remove cases
  const fullPath = `tests/cases/_${dirName}`;

  let fileList = [];
  try {
    fileList = await fs.readdir(fullPath);
  } catch (e) {
    if (e.errno === -4058 || e.errno === -2) {
      /**
       * When dir does not exist, just create it
       * since which will be used to contain case files later,
       * when there will be no step to create non-existed folder.
       */
      await fs.mkdir(fullPath);
      return;
    }
  }

  // Remove files whose name starts with _
  for (const name of fileList.filter(name => name.charAt(0) === '_')) {
    try {
      await fs.rm(`${fullPath}/${name}`);
      console.log(`Cleaned: ${fullPath}/${name}`);
    } catch (e) {
    }

  }

  // Remove suite
  const suitePath = `tests/suites/_${dirName}.test.js`;
  try {
    await fs.rm(suitePath);
    console.log(`Cleaned: ${suitePath}`);
  } catch (e) {
  }
};

/**
 * Extract example code from documentation for jest to use.
 * @param content The raw code content
 * @param dirName The directory name to which generated files save
 * @param lang The lang of the code snippet
 * @param meta The parsed meta object
 * @returns {Promise<void>}
 */
const buildCaseFile = async (content, dirName, lang, meta) => {
  // const ast = parser.parse(t.text, {
  //   sourceType: config['st'] || 'script'
  // });
  //
  // // loading a cjs module from an esm module, `*.default` is used
  // const formattedCode = generate.default(ast, {
  //   retainLines: true
  // }).code;

  // default source type is 'script', which extname can be simply '.js' rather than '.cjs';
  // esm files should explicitly set extname to '.mjs'
  const ext = lang === 'js' ? (meta.module ? 'mjs' : 'js') : lang;

  const genPath = `_${dirName}/_${meta.name}.${ext}`;

  try {
    await fs.writeFile(`tests/cases/${genPath}`, content);
    console.log(`Generated case: ${genPath}`);
  } catch (e) {
    console.error(e);
  }
};

/**
 * Build corresponding jest code for specified content using meta infos.
 * @param metaQueue The mate infos (refer to docs/misc/metaFormat.md for details)
 * @returns {void}
 */
const buildSuiteCode = async (metaQueue) => {
  if (metaQueue.length === 0) {
    console.log('No meta infos collected, skip');
  }

  const innerDescribes = [];

  // The first element always refers to the object describing global infos
  const dirName = metaQueue[0].name;

  for (let i = 1; i < metaQueue.length; i++) {
    let thisMeta = metaQueue[i];

    const beforeAllContent = [];
    beforeAllContent.push(
      // TODO: Extension name should be dynamic according to meta
      template.default.ast(`await analyse('tests/cases/_${dirName}/_${thisMeta.name}.js')`)
    );
    let capturedStatement;
    if (thisMeta.filter) {
      // TODO: Support filter as array
      capturedStatement = template.default.ast(`captured = global.eContainer.all.filter(e => e.type === '${thisMeta.filter}')`);
    } else {
      capturedStatement = template.default.ast(`captured = global.eContainer.all`);
    }
    beforeAllContent.push(capturedStatement);

    const innerDescribeBody = [];

    for (const [j, ent] of thisMeta.entities.entries()) {
      innerDescribeBody.push(
        template.default.ast(`test('contains entity ${ent.name}', () => {
        expect(captured[${j}].name).toBe('${ent.name}');
        expect(expandENRELocation(captured[${j}])).toEqual(buildFullLocation(${ent.loc[0]}, ${ent.loc[1]}, ${ent.name.length}));
        expect(captured[${j}].kind).toBe('${ent.kind}');
        })`)
      );
    }

    innerDescribes.push(innerDescribe({
      name: t.stringLiteral(thisMeta.name),
      beforeAll: t.blockStatement(beforeAllContent),
      tests: innerDescribeBody,
    }));
  }

  /**
   * Only create suite file if it does contain at least 1 valid testcase.
   */
  if (innerDescribes.length !== 0) {
    const outerDescribe = t.callExpression(
      t.identifier('describe'),
      [
        t.stringLiteral(dirName),
        t.arrowFunctionExpression(
          [],
          t.blockStatement(innerDescribes),
        )
      ]
    );

    const ast = header({body: outerDescribe});

    try {
      await fs.writeFile(`tests/suites/_${dirName}.test.js`, generate.default(ast).code);
      console.log(`Generated suite: ${dirName}`);
    } catch (e) {
      console.error(e);
    }
  }
};

cli
  .command('test')
  .description('generate test cases and suites from docs/entity/* or docs/relation/*\nleaving option empty will process all files')
  .option('-e --entity [name...]',
    'specify doc scope in docs/entity\nleaving name empty will process all files under docs/entity')
  .option('-r --relation [name...]',
    'specify doc scope in docs/relation\nleaving name empty will process all files under docs/relation)')
  .action(async (opts) => {
    let caseCount = 0;
    let suiteCount = 0;

    iterateDocFile: for (const filePath of await fileHelper(opts)) {
      let f;

      try {
        f = await fs.readFile(filePath, 'utf-8');
      } catch (e) {
        if (e.errno === -4058 || e.errno === -2) {
          // code === 'ENOENT'
          console.error(`❌ Can not find document at ${e.path}`);
        } else {
          console.error(`Unknown error with errno=${e.errno} and code=${e.code}`);
        }
        continue;
      }

      /**
       * Since marked will accumulate multiple input parsed results,
       * we have to create new object whenever processing a new file.
       */
      const tokens = new marked.Lexer().lex(f).filter(t => t.type !== 'space');

      let dirName;
      let isPatternBlock = false;
      let metBefore = false;
      let metaQueue = [];

      for (const [i, t] of tokens.entries()) {
        if (t.type === 'heading') {
          if (t.text === 'Supported pattern') {
            isPatternBlock = true;
            metBefore = true;

            const meta = tokens[i + 1];
            suiteCount += 1;

            if (meta.type !== 'code' || meta.lang !== 'yaml') {
              // docs without codegen
              console.warn(`⚠ ${filePath} contains no meta info of test dirname, ignored`);
              continue iterateDocFile;
            }

            const metaParsed = YAML.parse(meta.text);
            // TODO: Validate
            metaQueue.push(metaParsed);
            dirName = metaParsed.name;

            await setupDir(dirName);
          } else {
            if (metBefore) {
              break;
            }
          }
        } else if (isPatternBlock && t.type === 'list' && !t.ordered) {
          caseCount += 1;
        } else if (isPatternBlock && t.type === 'code' && ['js', 'ts', 'jsx', 'tsx'].indexOf(t.lang) >= 0) {
          const meta = tokens[i + 1];

          // To enforce all code snippet tp be auto tested
          if (meta.type !== 'code' || meta.lang !== 'yaml') {
            console.error(`❌ The NEXT block of a sample code HAS TO be an YAML block with meta infos\n\tat ${filePath}`);
            process.exit(-1);
          }

          const metaParsed = YAML.parse(meta.text);
          // TODO: Validate parsed meta object

          await buildCaseFile(t.text, dirName, t.lang, metaParsed);

          metaQueue.push(metaParsed);
        }
      }

      await buildSuiteCode(metaQueue);
    }

    console.log(`Total ${caseCount} testcase(s) and ${suiteCount} test suites generated`);
  });

cli.parse(process.argv);
