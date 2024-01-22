import {marked} from 'marked';
import {readdir, readFile} from 'node:fs/promises';

const fixtures = {};

const fixtureGroups = await readdir('../fixtures');

for await (const fixtureGroup of fixtureGroups) {
  fixtures[fixtureGroup] = {};

  const fixtureFeatures = await readdir(`../fixtures/${fixtureGroup}`);

  for await (const fixtureFeature of fixtureFeatures) {
    if (fixtureFeature.endsWith('.gdl')) continue;

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
  }
}

// Data print
let featureCount = 0, metricCount = 0;
Object.keys(fixtures).sort((a, b) => a < b).forEach(fixtureGroup => {
  Object.keys(fixtures[fixtureGroup]).sort((a, b) => a < b).forEach(fixtureFeature => {
    const obj = fixtures[fixtureGroup][fixtureFeature];
    console.log(`${fixtureGroup},${fixtureFeature},${obj['title']},${obj['metrics'].join(',')}`);
    
    featureCount += 1;
    metricCount += obj['metrics'].length;
  });
});

console.log(`\nTotal features: ${featureCount}, Total metrics: ${metricCount}`);
