import {Command} from 'commander/esm.mjs';
import {promises as fs} from 'fs';
import marked from 'marked';
import parser from '@babel/parser';
import generate from '@babel/generator';

const cli = new Command();

const fileHelper = async (opts) => {
  // TODO: consume opts to determine scope of processing,
  //  and delete old generated files (note that add files to auto-gen dirs is allowed and shouldn't be deleted)

  let fileList = await fs.readdir('docs/entities');
  return await Promise.all(fileList.map(async f => await fs.readFile(`docs/entities/${f}`, 'utf-8')));
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

    for (const f of await fileHelper(opts)) {
      const tokens = lexer.lex(f);

      let dirName;
      let isPatternBlock = false;
      let metBefore = false;
      let caseNum;

      for (const [i, t] of tokens.entries()) {
        if (t.type === 'heading') {
          if (t.text === 'Supported pattern') {
            isPatternBlock = true;
            metBefore = true;

            const meta = tokens[i + 1];

            if (meta.type !== 'blockquote') {
              console.error('❌ A block after subtitle SHOULD be blockquote with meta infos');
              process.exit(-1);
            }

            dirName = meta.tokens[0].text.replace(/\s+/g, '').split('=')[1];
          } else {
            if (metBefore) {
              break;
            }
          }
        } else if (isPatternBlock && t.type === 'list') {
          caseNum = t.start;
        } else if (isPatternBlock && t.type === 'code' && ['js', 'ts'].indexOf(t.lang) >= 0) {
          // TODO: Support JSX & TSX extension
          const meta = tokens[i - 1];

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

          const ast = parser.parse(t.text, {
            sourceType: config['st'] || 'script'
          });

          // loading a cjs module from an esm module, `*.default` is used
          const formattedCode = generate.default(ast, {
            comments: false
          }).code;

          // default source type is 'script', which extname can be simply '.js' rather than '.cjs';
          // esm files should explicitly set extname to '.mjs'
          const ext = t.lang === 'js' ? (config['st'] === 'module' ? 'mjs' : 'js') : t.lang;
          console.log(`${dirName}/_${caseNum}_${config['cn']}.${ext}`);
        }
      }
    }
  });

cli.parse(process.argv);
