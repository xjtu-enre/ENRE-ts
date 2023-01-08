import usingCore, {preferences} from '@enre/core';
import cli from './cli';
import lsifDumper from './dumper/lsif';

cli.parse(process.argv);
const opts = cli.opts();

// Override default preferences according to command-line input
preferences.set('performance.multi-thread-enabled', opts.multiThread);
preferences.set('logging.verbose', opts.verbose);
preferences.set('performance.number-of-processors', parseInt(process.env.NUMBER_OF_PROCESSORS || '1'));
preferences.set('info.base-path', process.cwd());

// Trigger core functionality to do the analysis
await usingCore(opts.input, opts.exclude);

lsifDumper(opts);
