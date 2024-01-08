import usingCore from '@enre-ts/core';
import path from 'path';
import cli from './cli';
import jsonDumper from './dumper/enre-json';
import lsifDumper from './dumper/lsif';
import {setLogLevel} from '@enre-ts/shared/lib/create-logger';

cli.parse(process.argv);
const opts = cli.opts();

if (opts.verbose) {
  setLogLevel('verbose');
}

// Trigger core functionality to do the analysis
await usingCore(opts.input, opts.exclude);

if (opts.output !== false) {
  const exportFormat = path.extname(opts.output);
  if (exportFormat === '.json') {
    jsonDumper(opts);
  } else if (exportFormat === '.lsif') {
    lsifDumper(opts);
  }
}
