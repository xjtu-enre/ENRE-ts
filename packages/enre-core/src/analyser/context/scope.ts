import {ENREEntityCollectionScoping, ENREEntityFile} from '@enre/container';
import {panic} from '@enre/logging';

export type ENREScope = [ENREEntityFile, ...ENREEntityCollectionScoping[]];

export const lastOf = <T extends ENREEntityCollectionScoping = ENREEntityCollectionScoping>(scope: ENREScope): T => {
  const last = scope.at(-1);

  if (!last) {
    panic('Unexpected access to undefined parent, this usually indicates the scoping mechanism is broken');
  }

  return last as T;
};
