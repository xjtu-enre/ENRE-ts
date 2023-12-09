import {Command} from 'commander';

const cli = new Command();

cli
  .description('Generate test cases and suites from docs/entity/* or docs/relation/*\nleaving option empty will process all')
  .option('-e --entity [name...]',
    'Specify scope names in docs/entity\nleaving name empty will process all files under docs/entity')
  .option('-r --relation [name...]',
    'Specify scope names in docs/relation\nleaving name empty will process all files under docs/relation')
  .option('-i --implicit [name...]',
    'Specify scope names in docs/implicit\nleaving name empty will process all files under docs/implicit')
  .option('-m --manual [name...]',
    'Specify scope names in tests/cases that are manually written\nleaving name empty will process all test cases under tests/cases');

export default cli;
