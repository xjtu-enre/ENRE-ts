import {Command} from 'commander';
import {panic} from '@enre/logging';
import finder from '@enre/doc-path-finder';
import parser from '@enre/doc-parser';
import selectAdapter from './adapters';
import {reset} from './slim-container';
import add from './common/result-add';
import {MatchResult} from './matchers/match-result';
import caseWriter from './common/case-writer';
import resultPercentage from './common/result-percentage';
import {getCategoryLevelData} from './matchers/universal';
import dataMerger from './common/data-merger';

const profiles = {
  /** line, column start from 1 **/
  cpp: {tag: /[cC][pP][pP]/, str: 'cpp', lang: 'C++'},
  /** line, column start from 1 **/
  java: {tag: /[jJ][aA][vV][aA]/, str: 'java', lang: 'Java'},
  /** line starts from 1, column starts from 0 **/
  python: {tag: /[pP][yY]([tT][hH][oO][nN])?/, str: 'py / python', lang: 'Python'},
  /** line, column start from 1 **/
  ts: {tag: undefined, str: undefined, lang: 'TypeScript'},
} as { [lang: string]: { tag?: RegExp, str?: string, lang: string } };

const cli = new Command();

cli
  .description('run doc testing on external tools')
  .argument('<lang>', 'Target language: cpp / java / python / ts')
  .argument('<docpath>', 'Absolute path to fixtures\' root directory')
  .argument('<tool>', 'Target tool: depends / enre / sourcetrail / understand')
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
          console.log((resultPercentage(resultAccumulated!) * 100).toFixed(1));
          console.log(`\\rowgene{${resultAccumulated?.entity.fullyCorrect}}{${resultAccumulated?.entity.wrongProp}}{${resultAccumulated?.entity.wrongType}}{${resultAccumulated?.entity.missing}}{${resultAccumulated?.entity.unexpected}} & \\rowgenr{${resultAccumulated?.relation.fullyCorrect}}{${resultAccumulated?.relation.wrongProp}}{${resultAccumulated?.relation.wrongType}}{${resultAccumulated?.relation.wrongNode}}{${resultAccumulated?.relation.missing}}{${resultAccumulated?.relation.unexpected}}`);
          const categoryLevelData = getCategoryLevelData();
          dataMerger(categoryLevelData, tool[0], docpath);
        }
      },

      undefined,

      async (entry, c, g) => {
        console.log(`${g.name}/${c.assertion.name}`);

        await caseWriter(g.name, c.assertion.name, c);

        const result = await adapter!(g.name, c.assertion.name, c, originalCwd, exepath);

        if (resultAccumulated) {
          if (result) {
            add(resultAccumulated, result);
          }
        } else {
          resultAccumulated = result;
        }
        console.log(result);
        reset();
      },

      profiles[lang].tag,
      profiles[lang].str,
      true,
    );
  });

cli.parse(process.argv);
