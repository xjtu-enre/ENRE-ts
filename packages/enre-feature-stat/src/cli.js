/**
 * This script expects the CWD to be this containing src directory.
 */

import {marked} from 'marked';
import {Command} from 'commander';
import {copyFile, mkdir, readdir, readFile, rmdir, writeFile} from 'node:fs/promises';

const cli = new Command();

cli.command('stat')
  .description('Print statistics')
  .action(async () => {
    const fixtures = {};

    for await (const fixtureGroup of await readdir('../fixtures')) {
      if (fixtureGroup.startsWith('_')) continue;

      fixtures[fixtureGroup] = {
        gdls: [],
      };

      for await (const fixtureFeature of await readdir(`../fixtures/${fixtureGroup}`)) {
        if (fixtureFeature.endsWith('.gdl')) {
          fixtures[fixtureGroup].gdls.push(fixtureFeature);
          continue;
        }

        fixtures[fixtureGroup][fixtureFeature] = {
          title: undefined,
          metrics: [],
          tags: [],
          gdls: [],
        };

        const fileContent = await readFile(`../fixtures/${fixtureGroup}/${fixtureFeature}/README.md`, 'utf8');

        const tokens = new marked.Lexer().lex(fileContent);

        let title = 'others';
        let codeBlockCount = 0;
        for await (const token of tokens) {
          if (token.type === 'heading' && token.depth === 1) {
            fixtures[fixtureGroup][fixtureFeature].title = token.text;
          }

          if (token.type === 'heading' && token.depth === 2) {
            if (token.text === 'Patterns') {
              title = 'patterns';
            } else if (token.text === 'Metrics') {
              title = 'metrics';
            } else if (token.text === 'Tags') {
              title = 'tags';
            } else {
              title = 'others';
            }
          }

          if (token.type === 'code') {
            await writeFile(`../fixtures/${fixtureGroup}/${fixtureFeature}/_test${codeBlockCount}.${token.lang}`, token.text);
            codeBlockCount += 1;
          }

          if (token.type === 'list') {
            if (title === 'metrics') {
              token.items.forEach(item => {
                fixtures[fixtureGroup][fixtureFeature].metrics.push(item.text);
              });
            } else if (title === 'tags') {
              token.items.forEach(item => {
                fixtures[fixtureGroup][fixtureFeature].tags.push(item.text);
              });
            }
          }
        }

        for await (const fName of await readdir(`../fixtures/${fixtureGroup}/${fixtureFeature}`)) {
          if (fName.endsWith('.gdl')) {
            fixtures[fixtureGroup][fixtureFeature].gdls.push(fName);
          }
        }
      }
    }

// Data print
    let
      featureCount = 0,
      metricCount = 0,
      featureImplementedCount = 0,
      featureIgnoredCount = 0,
      actualGdlScriptCount = 1; // Manually add `_utils/Enrets.gdl` to the count

    Object.keys(fixtures)
      .sort((a, b) => a < b)
      .forEach(fixtureGroup => {
        actualGdlScriptCount += fixtures[fixtureGroup].gdls.filter(gdl => gdl.startsWith('get')).length;

        Object.keys(fixtures[fixtureGroup])
          .sort((a, b) => a < b)
          .forEach(fixtureFeature => {
            if (fixtureFeature === 'gdls') return;

            const obj = fixtures[fixtureGroup][fixtureFeature];
            console.log(`${fixtureGroup},${fixtureFeature},${obj['title']},MetricsCount: ${obj['metrics'].length}`);

            featureCount += 1;
            metricCount += obj['metrics'].length;

            obj.gdls.forEach(gdl => {
              featureImplementedCount += 1;
              if (gdl.startsWith('get')) {
                actualGdlScriptCount += 1;
              } else if (gdl.startsWith('use')) {
                /* ... */
              } else if (gdl.startsWith('ignore')) {
                featureImplementedCount -= 1;
                featureIgnoredCount += 1;
              }
            });
          });
      });

    console.log('\n');
    console.log(`Total features: ${featureCount}`);
    console.log(`Total metrics: ${metricCount}`);
    console.log(`Features implemented: ${featureImplementedCount}`);
    console.log(`Features ignored: ${featureIgnoredCount}`);
    console.log(`WIP features: ${featureCount - featureImplementedCount - featureIgnoredCount}`);
    console.log(`Wrote Godel scripts: ${actualGdlScriptCount}`);
  });

cli.command('gather')
  .description('Gather all Godel scripts')
  .action(async () => {
    const scripts = [];

    for await (const fixtureGroup of await readdir('../fixtures')) {
      if (fixtureGroup.startsWith('_')) continue;

      for await (const fixtureFeature of await readdir(`../fixtures/${fixtureGroup}`)) {
        if (fixtureFeature.endsWith('.gdl') && fixtureFeature.startsWith('get')) {
          scripts.push(`../fixtures/${fixtureGroup}/${fixtureFeature}`);
        } else {
          for await (const fName of await readdir(`../fixtures/${fixtureGroup}/${fixtureFeature}`)) {
            if (fName.endsWith('.gdl') && fName.startsWith('get')) {
              scripts.push(`../fixtures/${fixtureGroup}/${fixtureFeature}/${fName}`);
            }
          }
        }
      }
    }

    try {
      await rmdir('../lib', {recursive: true});
    } catch {
      /* Do noting */
    } finally {
      await mkdir('../lib');

      for await (const script of scripts) {
        // Remove the `get-` prefix from the file name
        await copyFile(script, `../lib/${script.split('/').pop().substring(4)}`);
      }
    }
  });

cli.parse(process.argv);
