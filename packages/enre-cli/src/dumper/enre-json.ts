import {eGraph, release, rGraph} from '@enre/data';
import {expandENRELocation} from '@enre/location';
import fs from 'node:fs/promises';

const ignorePropList = [
  'children',
  'pointsTo',
  'arguments',
  'exports',
  'imports',
  'declarations',
  'alias',
  'ofRelation',
  'logs',
  'getQualifiedName',
  'getSourceFile',
  'pkgJSON',
];

export default function (opts: any) {
  release();

  // ENRE-JSON output format
  const obj = {entities: [] as any[], relations: [] as any[]};

  for (const e of eGraph.all) {
    const tmp = {} as any;
    for (const prop of Object.getOwnPropertyNames(e)) {
      tmp['fullname'] = e.getQualifiedName();
      if (prop === 'name') {
        tmp[prop] = e.name.string;
      } else if (prop === 'location') {
        tmp[prop] = expandENRELocation(e);
      } else if (ignorePropList.includes(prop)) {
        // Ignore
      } else if (['sourceFile', 'parent'].indexOf(prop) !== -1) {
        tmp[prop] = (e as any)[prop]?.id;
      } else {
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
        };
      } else if (ignorePropList.includes(prop)) {
        /* Ignore */
      } else {
        tmp[prop] = (r as any)[prop];
      }
    }
    obj.relations.push(tmp);
  }

  fs.writeFile(opts.output, JSON.stringify(obj, null, '\t'));
}
