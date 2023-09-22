import {Command, InvalidOptionArgumentError} from 'commander';
import path from 'path';
// import pJSON from '../package.json' assert {type: 'json'};

const cli = new Command();

cli
  .description('A static source code entity relationship extractor for ECMAScript and TypeScript.')
  // TODO: Actual import package.json
  .version('0.0.1')
  .option('-i, --input <path...>',
    'specify path(s) to file or directory')
  .option('-o, --output <file path>/false',
    'specify where to output the analyse results\nuse extension \'.json\' (default) or \'.lsif\' to specify format',
    (v) => {
      if (v === 'false') {
        return false;
      }

      const ext = path.extname(v);
      if (['.json', '.lsif'].indexOf(ext) === -1) {
        throw new InvalidOptionArgumentError('Output file path has to end with a valid extension name.');
      }
      return v;
    },
    './output.json')
  .option('-e, --exclude <name...>',
    'specify file or directory name to be excluded from analysis')
  .option('-v, --verbose',
    'enable to print more message while processing', false);

export default cli;
