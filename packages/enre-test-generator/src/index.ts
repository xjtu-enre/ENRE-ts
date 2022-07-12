import parser from '@enre/doc-parser';
import finder from '@enre/doc-path-finder';
import {Command} from 'commander';

for await (const path of finder({entity: true})) {
  console.log(path);
}

await parser(['docs/entity/parameter.md'], (path, groupMeta) => {
  // console.log(groupMeta.name);
}, (path, caseObj, groupMeta) => {
  // console.log(caseObj);
});

const cli = new Command();

cli
  .command('parse')
  .description('generate test cases and suites from docs/entity/* or docs/relation/*\nleaving option empty will process all entries')
  .option('-e --entity [name...]',
    'specify scope names in docs/entity\nleaving name empty will process all files under docs/entity')
  .option('-r --relation [name...]',
    'specify scope names in docs/relation\nleaving name empty will process all files under docs/relation)')
  .action(() => {
    //TODO
  });
