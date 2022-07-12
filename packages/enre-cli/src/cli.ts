import {Command} from 'commander';
// import pJSON from '../package.json' assert {type: 'json'};

const cli = new Command();

cli
  .description('An open source entity relationship extractor for ECMAScript and TypeScript.')
  // TODO: Actual import package.json
  .version('TODO FIX')
  .option('-i, --input <path>',
    'specify the path to a file or directory', '.')
  .option('-o, --output <path>',
    'specify where to output the analyse results', '.')
  .option('-e, --exclude <relative-path...>',
    'specify files or directories to be excluded during analysis')
  .option('-m, --multi-thread',
    'enable to use multi thread to speed up analyse processing', false)
  .option('-v, --verbose',
    'enable to print more message while processing', false);

export default cli;

