/**
 * This script expects the CWD to be this containing src directory.
 */

import {marked} from 'marked';
import {readdir, readFile, writeFile} from 'node:fs/promises';

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
  actualGdlScriptCount = 0;

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
