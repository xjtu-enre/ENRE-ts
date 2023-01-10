import { eGraph, rGraph } from '@enre/container';
import usingCore, { preferences } from '@enre/core';
import { expandENRELocation } from '@enre/location';
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
const obj = { entities: new Array(), relations: new Array() };
for (const e of eGraph.all) {
  const tmp = {} as any;
  for (const prop of Object.getOwnPropertyNames(e)) {
    if (prop === 'name') {
      tmp[prop] = typeof e.name === 'string' ? e.name : e.name.printableName;
    } else if (prop === 'location') {
      tmp[prop] = expandENRELocation(e);
    } else if (['children', 'exports', 'imports', 'declarations'].indexOf(prop) !== -1) {
      // Ignore
    } else if (['sourceFile', 'parent'].indexOf(prop) !== -1) {
      tmp[prop] = (e as any)[prop].id;
    }
    else {
      tmp[prop] = (e as any)[prop];
    }
  }
  obj.entities.push(tmp);
}
for (const r of rGraph.all) {
  const tmp = {} as any;
  for (const prop of Object.getOwnPropertyNames(r)) {
    if (['from', 'to'].indexOf(prop) !== -1) {
      tmp[prop] = (r as any)[prop].id;
    } else if (prop === 'location') {
      tmp[prop] = {
        line: r.location.start.line,
        column: r.location.start.column,
      }
    } else {
      tmp[prop] = (r as any)[prop];
    }
  }
  obj.relations.push(tmp);
}

fs.writeFile(path.resolve(opts.output, 'output.json'), JSON.stringify(obj, null, '\t'));
