import {ENRELocKey} from '@enre/location';
import {ENREEntityCollectionAll, ENREEntityCollectionInFile} from '@enre/data';

export default function lookdown(by: 'loc-key', payload: ENRELocKey, scope: ENREEntityCollectionInFile): ENREEntityCollectionInFile | undefined;
export default function lookdown(by: 'name', payload: string, scope: ENREEntityCollectionInFile): ENREEntityCollectionInFile | undefined;
export default function lookdown(by: 'loc-key' | 'name', payload: ENRELocKey | string, scope: ENREEntityCollectionInFile): ENREEntityCollectionAll | undefined {
  const waitingList = [...scope.children];

  // TODO: Condition disable points-to search?
  if ('pointsTo' in scope) {
    waitingList.push(...scope.pointsTo);
  }

  for (const entity of waitingList) {
    if (by === 'loc-key') {
      if ('location' in entity) {
        if (entity.location.start.line === payload.line
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

  return undefined;
}
