import {readdir, readFile, writeFile} from 'node:fs/promises';
import {marked} from 'marked';

export default async function () {
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
        hasPostScript: false,
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
        } else if (fName === 'index.js') {
          fixtures[fixtureGroup][fixtureFeature].hasPostScript = true;
        }
      }
    }
  }

  return fixtures;
}
