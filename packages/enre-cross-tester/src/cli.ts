import {Command} from 'commander';
import {panic} from '@enre/logging';
import finder from '@enre/doc-path-finder';
import parser from '@enre/doc-parser';
import {understandTs} from './adapters';
import {reset} from './slim-container';
import {usingNewFormatProfile} from '@enre/naming';
import {FormatProfile} from '@enre/naming/lib/format-profiles';
import add from './common/result-add';
import {MatchResult} from './matchers/match-result';

usingNewFormatProfile(FormatProfile.understand);

const cli = new Command();

cli
  .description('run doc testing on external tools')
  .argument('<lang>', 'Target language: cpp / java / python / ts')
  .argument('<docpath>', 'Absolute path to ENRE root directory')
  .argument('<tool>', 'Target tool: depends / enre / sourcetrail / understand')
  .action(async (lang: string, docpath: string, tool: string) => {
    if (!['cpp', 'java', 'python', 'ts'].includes(lang)) {
      panic(`Unsupported language ${lang}`);
    }
    if (!['depends', 'enre', 'sourcetrail', 'understand'].includes(tool)) {
      panic(`Unsupported tool ${tool}`);
    }

    process.chdir(docpath);
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
        const result = await understandTs(g.name, c.assertion.name, c);
        if (resultAccumulated && result) {
          add(resultAccumulated, result);
        } else {
          resultAccumulated = result;
        }
        // console.log(result);
        reset();
      }
    );
  });

cli.parse(process.argv);
