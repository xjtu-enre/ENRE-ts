import {ENRELocKey} from '@enre/location';
import {ENREEntityCollectionAll, ENREEntityCollectionInFile} from '@enre/data';

export default function lookdown(by: 'loc-key', payload: ENRELocKey, scope: ENREEntityCollectionInFile): ENREEntityCollectionInFile | undefined;
export default function lookdown(by: 'name', payload: string, scope: ENREEntityCollectionInFile): ENREEntityCollectionInFile | undefined;
export default function lookdown(by: 'loc-key' | 'name', payload: ENRELocKey | string, scope: ENREEntityCollectionInFile): ENREEntityCollectionAll | undefined {
  const waitingList = [...scope.children];

  // TODO: Condition disable points-to search?
  if ('pointsTo' in scope) {
    /**
     * `pointsTo` can hold either ENREEntity or JSObjRepr, and ENREEntities are add to list for name searching,
     * JSObjRepr(s) have its own dedicate searching mechanism.
     */
    waitingList.push(...scope.pointsTo.filter(i => i.type !== 'object'));
  }

  for (const entity of waitingList) {
    if (by === 'loc-key') {
      if ('location' in entity) {
        // @ts-ignore
        if (entity.location.start.line === payload.line
          // @ts-ignore
          && entity.location.start.column === payload.column) {
          return entity;
        }
      }
    } else if (by === 'name') {
      if (entity.name.codeName === payload) {
        return entity;
      }
    }

    waitingList.push(...entity.children);
  }

  if ('pointsTo' in scope) {
    for (const objRepr of scope.pointsTo.filter(i => i.type === 'object')) {
      if ((payload as string) in objRepr.kv) {
        return objRepr.kv[payload as string];
      }
    }
  }

  return undefined;
}
