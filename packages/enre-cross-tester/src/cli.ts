import {Command} from 'commander';
import {panic} from '@enre/logging';
import finder from '@enre/doc-path-finder';
import parser from '@enre/doc-parser';
import selectAdapter from './adapters';
import {reset} from './slim-container';
import add from './common/result-add';
import {MatchResult} from './matchers/match-result';
import caseWriter from './common/case-writer';

const profiles = {
  cpp: {tag: /[cC][pP][pP]/, str: 'cpp', lang: 'C++'},
  java: {tag: /[jJ][aA][vV][aA]/, str: 'java', lang: 'Java'},
  python: {tag: /[pP][yY]([tT][hH][oO][nN])?/, str: 'py / python', lang: 'Python'},
  ts: {tag: undefined, str: undefined, lang: 'TypeScript'},
} as { [lang: string]: { tag?: RegExp, str?: string, lang: string } };

const cli = new Command();

cli
  .description('run doc testing on external tools')
  .argument('<lang>', 'Target language: cpp / java / python / ts')
  .argument('<docpath>', 'Absolute path to ENRE root directory')
  .argument('<tool>', 'Target tool: depends / enre1 / sourcetrail / understand')
  .argument('<exepath>', 'Absolute path to tool executable')
  .action(async (lang: string, docpath: string, tool: string, exepath: string) => {
    if (!['cpp', 'java', 'python', 'ts'].includes(lang)) {
      panic(`Unsupported language ${lang}`);
    }
    if (!['depends', 'enre', 'sourcetrail', 'understand'].includes(tool)) {
      panic(`Unsupported tool ${tool}`);
    }

    const originalCwd = process.cwd();

    process.chdir(docpath);
    const adapter = selectAdapter(lang, tool);
    const allCategories = await finder({});

    let resultAccumulated: MatchResult | undefined = undefined;

    await parser(
      allCategories,

      async (_, g) => {
        if (g.name === 'END_OF_PROCESS') {
          console.log(resultAccumulated);
        }
      },

      undefined,

      async (entry, c, g) => {
        console.log(`${g.name}/${c.assertion.name}`);

        await caseWriter(g.name, c.assertion.name, c);

        const result = await adapter!(g.name, c.assertion.name, c, originalCwd, exepath);

        if (resultAccumulated && result) {
          add(resultAccumulated, result);
        } else {
          resultAccumulated = result;
        }
        console.log(result);
        reset();
      },

      profiles[lang].tag,
      profiles[lang].str,
    );
  });

cli.parse(process.argv);
