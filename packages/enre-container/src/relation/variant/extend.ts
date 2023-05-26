import {ENRELocation} from '@enre/location';
import rGraph from '../../container/r';
import {ENRERelationAbilityBase, recordRelationBase} from '../ability/base';
import {ENREEntityCollectionInFile} from '../../entity/collections';

// type ToType<T> = T extends ENREEntityClass ? ENREEntityClass : (T extends ENREEntityInterface ? ENREEntityClass | ENREEntityInterface : ENREEntityCollectionAll);

export interface ENRERelationExtend extends ENRERelationAbilityBase {
  readonly type: 'extend',
}

export const recordRelationExtend = (
  from: ENREEntityCollectionInFile,
  to: ENREEntityCollectionInFile,
  location: ENRELocation,
): ENRERelationExtend => {
  const _base = recordRelationBase(from, to, location);

  const _obj = {
    ..._base,

    get type() {
      return 'extend' as const;
    },
  };

  rGraph.add(_obj);

  return _obj;
};
