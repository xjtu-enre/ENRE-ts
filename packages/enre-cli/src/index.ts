import {eGraph} from '@enre/container';
import usingCore, {preferences} from '@enre/core';
import fs from 'node:fs/promises';
import path from 'node:path';
import cli from './cli';

cli.parse(process.argv);
const opts = cli.opts();

// Override default preferences according to command-line input
preferences.set('performance.multi-thread-enabled', opts.multiThread);
preferences.set('logging.verbose', opts.verbose);
preferences.set('performance.number-of-processors', parseInt(process.env.NUMBER_OF_PROCESSORS || '1'));
preferences.set('info.base-path', process.cwd());

// Trigger core functionality to do the analysis
await usingCore(opts.input, opts.exclude);

// Output JSON file is handled here
// TODO: Modularize
const obj = {entities: new Array(), relations: 'Currently disabled in this release'};
for (const e of eGraph.all) {
  obj.entities.push({name: typeof e.name === 'string' ? e.name : e.name.printableName, type: e.type, id: e.id});
}
fs.writeFile(path.resolve(opts.output, 'output.json'), JSON.stringify(obj, null, '\t'));
