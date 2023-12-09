import {eGraph, rGraph} from '@enre-ts/data';

export type id<T> = T & { id: number };

export function recordEntity<T extends (...params: any[]) => any>(createFunction: T, party: 'first' | 'third' = 'first'): ((...params: Parameters<T>) => id<ReturnType<T>>) {
  return function (...params: any[]) {
    const created = createFunction(...params);
    eGraph.add(created, party);
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
