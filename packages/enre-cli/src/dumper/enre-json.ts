import { eGraph } from '@enre/container';
import fs from 'node:fs/promises';

export default function (opts: any) {
  const obj = { entities: [], relations: 'Currently disabled in this release' };
  for (const e of eGraph.all) {
    // @ts-ignore
    obj.entities.push({ name: typeof e.name === 'string' ? e.name : e.name.printableName, type: e.type, id: e.id });
  }
  fs.writeFile(opts.output, JSON.stringify(obj, null, '\t'));
}
