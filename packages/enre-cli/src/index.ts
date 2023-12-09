import usingCore from '@enre-ts/core';
import path from 'path';
import cli from './cli';
import jsonDumper from './dumper/enre-json';
import lsifDumper from './dumper/lsif';

cli.parse(process.argv);
const opts = cli.opts();

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
