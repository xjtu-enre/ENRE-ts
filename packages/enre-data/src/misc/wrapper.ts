import {eGraph, rGraph} from '@enre/data';

export function recordEntity<T extends (...params: any[]) => any>(createFunction: T): T {
  return function (...params: any[]) {
    const created = createFunction(...params);
    eGraph.add(created);
    return created;
  } as any;
}

export function recordRelation<T extends (...params: any[]) => any>(createFunction: T): T {
  return function (...params: any[]) {
    const created = createFunction(...params);
    rGraph.add(created);
    return created;
  } as any;
}
