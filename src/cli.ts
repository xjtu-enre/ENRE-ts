import { Command } from 'commander'

const pJson = require('../package.json');

const cli = new Command();

cli
  .description('An open source entity relationship extractor for ECMAScript.')
  .version(pJson.version)
  .option('-i, --input <path>', 'specify the path to a file or directory',".")
  .option('-o, --output <path>', 'specify where to output the analyse results', '.')

export default cli

