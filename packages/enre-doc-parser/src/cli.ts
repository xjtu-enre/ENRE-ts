import finder from '@enre/doc-path-finder';
import {panic} from '@enre/logging';
import {Command} from 'commander';
import parser from './index';
import tableBuilder from './table-builder';

const cli = new Command();

const profiles = {
  cpp: {tag: /[cC][pP][pP]/, str: 'cpp', lang: 'C++'},
  java: {tag: /[jJ][aA][vV][aA]/, str: 'java', lang: 'Java'},
  python: {tag: /[pP][yY]([tT][hH][oO][nN])?/, str: 'py / python', lang: 'Python'},
  ts: {tag: undefined, str: undefined, lang: 'TypeScript'},
} as { [lang: string]: { tag?: RegExp, str?: string, lang: string } };

cli
  .description('generate test cases and suites from docs/entity/* or docs/relation/*\nleaving option empty will process all')
  .argument('<lang>', 'Target language: cpp / java / python / ts')
  .option('-e --entity [name...]',
    'specify scope names in docs/entity\nleaving name empty will process all files under docs/entity')
  .option('-r --relation [name...]',
    'specify scope names in docs/relation\nleaving name empty will process all files under docs/relation')
  .action(async (lang: string, opts: any) => {
    if (!['cpp', 'java', 'python', 'ts'].includes(lang)) {
      panic(`Unsupported language ${lang}`);
    }

    // If set to scan all, then a table should be generated.
    if (Object.keys(opts).length === 0) {
      // Add `file` entity that in case there is no test file yet
      const entityTypes: Array<string> = ['file'];
      let relationTable: any;

      await parser(
        // The inner logic makes sure that entity docs are iterated before relation docs
        finder(opts),

        async (path, group) => {
          if (path === '') {
            return;
          }

          const regexResult = /^docs\/(entity|relation)\/([\w-]+)\.md/.exec(path);

          if ((regexResult?.length || 0) < 3) {
            panic(`Given path ${path} fails regex validation`);
          }

          if (regexResult![1] === 'entity') {
            const type = regexResult![2].toLowerCase().replaceAll('-', ' ');
            entityTypes.includes(type) ? undefined : entityTypes.push(type);
          } else {
            if (!relationTable) {
              relationTable = [];
              entityTypes.forEach(() => {
                const column: Array<Array<string>> = [];
                entityTypes.forEach(() => column.push([]));
                relationTable.push(column);
              });
            }
          }
        },

        async (path, category, description) => {

        },

        async (path, c) => {
          if (c.assertion.relation) {
            c.assertion.relation.items.forEach((i: any) => {
              const fromIndex = entityTypes.indexOf(i.from.type);
              const toIndex = entityTypes.indexOf(i.to.type);
              if (fromIndex === -1) {
                panic(`Undocumented entity type ${i.from.type}`);
              }
              if (toIndex === -1) {
                panic(`Undocumented entity type ${i.to.type}`);
              }

              const type = i.type.toLowerCase();
              relationTable[fromIndex][toIndex].includes(type) ? undefined : relationTable[fromIndex][toIndex].push(i.type.toLowerCase());
            });
          }
        },

        profiles[lang].tag,
        profiles[lang].str,
      );

      await tableBuilder(profiles[lang].lang, entityTypes, relationTable);
    } else {
      await parser(
        finder(opts),
        async (path, group) => group.name !== 'END_OF_PROCESS' ? console.log(`Meets group '${group.name}'`) : undefined,
        async (path, category, description) => console.log(`|   Meets rule '${category}: ${description}'`),
        async (path, c) => console.log(`|   |   Meets case '${c.assertion.name}'`),
        profiles[lang].tag,
        profiles[lang].str,
      );
    }
  });

cli.parse(process.argv);
