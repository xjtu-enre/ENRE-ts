import {Command} from 'commander/esm.mjs';
import {promises as fs} from 'fs';
import marked from 'marked';
import parser from '@babel/parser';
import generate from '@babel/generator';

const cli = new Command();

const fileHelper = async (opts) => {
  // consume opts to determine scope of processing,
  // and delete old generated files (note that add files to auto-gen dirs is allowed and shouldn't be deleted)
  let todolist = [];

  let propertyProxy =
    Object.keys(opts).length === 0 ? ['entity', 'relation'] : Object.keys(opts);

  for (const property of propertyProxy) {
    let optionProxy;

    if (!opts[property] || opts[property] === true) {
      optionProxy = await fs.readdir(`docs/${{entity: 'entities', relation: 'relations'}[property]}`);
    } else {
      optionProxy = opts[property].map(item => `${item}.md`);
    }

    todolist.push(...optionProxy.map(item => `docs/${{entity: 'entities', relation: 'relations'}[property]}/${item}`));
  }

  return todolist;
};

const cleanAutogenFiles = async (dirName) => {
  const fullPath = `src/__tests__/cases/_${dirName}`;

  let fileList;
  try {
    fileList = await fs.readdir(fullPath);
  } catch (e) {
    if (e.errno === -4058) {
      return;
    }
  }

  // remove files whose name starts with _
  for (const name of fileList.filter(name => name.charAt(0) === '_')) {
    await fs.rm(`${fullPath}/${name}`);
    console.log(`Cleaned: ${fullPath}/${name}`);
  }
};

cli
  .command('testcase')
  .description('generate testcases from docs/entities/* or docs/relations/*\nleaving option empty will process all files')
  .option('-e --entity [name...]',
    'specify doc scope in docs/entities\nleaving name empty will process all files under docs/entities')
  .option('-r --relation [name...]',
    'specify doc scope in docs/relations\nleaving name empty will process all files under docs/relations)')
  .action(async (opts) => {
    const lexer = new marked.Lexer();

    iterateDocFile: for (const filePath of await fileHelper(opts)) {
      let f;

      try {
        f = await fs.readFile(filePath, 'utf-8');
      } catch (e) {
        if (e.errno === -4058) {                // code === 'ENOENT'
          console.error(`❌ Can not find document at ${e.path}`);
        } else {
          console.error(`Unknown error with errno=${e.errno} and code=${e.code}`);
        }
        continue;
      }

      const tokens = lexer.lex(f);

      let dirName;
      let isPatternBlock = false;
      let metBefore = false;
      let caseNum = 0;

      for (const [i, t] of tokens.entries()) {
        if (t.type === 'heading') {
          if (t.text === 'Supported pattern') {
            isPatternBlock = true;
            metBefore = true;

            const meta = tokens[i + 1];

            if (meta.type !== 'blockquote') {
              // docs without codegen
              console.warn(`⚠ ${filePath} contains no meta info of testcase dirname, ignored`);
              continue iterateDocFile;
            }

            // for now, the meta info of heading only contains cn(CaseName)
            // refactor to switch-case if definition is updated further
            dirName = meta.tokens[0].text.replace(/\s+/g, '').split('=')[1];

            await cleanAutogenFiles(dirName);
          } else {
            if (metBefore) {
              break;
            }
          }
        } else if (isPatternBlock && t.type === 'list' && !t.ordered) {
          caseNum += 1;
        } else if (isPatternBlock && t.type === 'code' && ['js', 'ts'].indexOf(t.lang) >= 0) {
          // TODO: Support JSX & TSX extension
          const meta = tokens[i - 1];

          // to enforce all example codes been auto tested
          if (meta.type !== 'blockquote') {
            console.error('❌ A block before example code SHOULD be blockquote with meta infos');
            process.exit(-1);
          }

          // cn(CaseName) st(SourceType)
          let config = {};
          meta.tokens[0].text
            .split('\n')
            .map(item => item.replace(/\s+/g, '').split('='))
            .forEach(item => {
              switch (item[0]) {
              case 'cn':
                config[item[0]] = item[1];
                break;
              case 'st':
                config[item[0]] = {cjs: 'script', esm: 'module'}[item[1]];
                break;
              }
            });

          // const ast = parser.parse(t.text, {
          //   sourceType: config['st'] || 'script'
          // });
          //
          // // loading a cjs module from an esm module, `*.default` is used
          // const formattedCode = generate.default(ast, {
          //   retainLines: true
          // }).code;

          const formattedCode = t.text;

          // default source type is 'script', which extname can be simply '.js' rather than '.cjs';
          // esm files should explicitly set extname to '.mjs'
          const ext = t.lang === 'js' ? (config['st'] === 'module' ? 'mjs' : 'js') : t.lang;
          const genPath = `_${dirName}/_${caseNum}_${config['cn']}.${ext}`;

          try {
            await fs.writeFile(`src/__tests__/cases/${genPath}`, formattedCode);
            console.log(`Generated: ${genPath}`);
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
  });

cli.parse(process.argv);
