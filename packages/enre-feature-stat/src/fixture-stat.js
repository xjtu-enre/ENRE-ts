import {marked} from 'marked';
import {readdir, readFile} from 'node:fs/promises';

const fixtures = {};

const fixtureGroups = await readdir('../fixtures');

fixtureGroups.forEach(async fixtureGroup => {
  fixtures[fixtureGroup] = {};

  const fixtureFeatures = await readdir(`../fixtures/${fixtureGroup}`);

  fixtureFeatures.forEach(async fixtureFeature => {
    if (fixtureFeature.endsWith('.gdl')) return;

    fixtures[fixtureGroup][fixtureFeature] = {
      title: undefined,
      metrics: [],
    };

    const fileContent = await readFile(`../fixtures/${fixtureGroup}/${fixtureFeature}/README.md`, 'utf8');

    const tokens = new marked.Lexer().lex(fileContent);

    let inMetrics = false;
    tokens.forEach(token => {
      if (token.type === 'heading' && token.depth === 1) {
        fixtures[fixtureGroup][fixtureFeature].title = token.text;
      }

      if (token.type === 'heading' && token.depth === 2 && token.text === 'Metrics') {
        inMetrics = true;
      }

      if (inMetrics && token.type === 'list') {
        token.items.forEach(item => {
          fixtures[fixtureGroup][fixtureFeature].metrics.push(item.text);
        });
      }
    });
  });
});

setTimeout(() => {
  Object.keys(fixtures).forEach(fixtureGroup => {
    Object.keys(fixtures[fixtureGroup]).forEach(fixtureFeature => {
      const obj = fixtures[fixtureGroup][fixtureFeature];
      console.log(`${fixtureGroup},${fixtureFeature},${obj['title']},${obj['metrics'].join(',')}`);
    });
  });
}, 1000);
