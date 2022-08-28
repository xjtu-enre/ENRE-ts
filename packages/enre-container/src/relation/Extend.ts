import {ENRELocation} from '@enre/location';
import rGraph from '../container/r';
import {ENREEntityClass} from '../entity/Class';
import {ENREEntityCollectionAll} from '../entity/collections';
import {ENREEntityInterface} from '../entity/Interface';
import {ENREEntityTypeParameter} from '../entity/TypeParameter';
import {ENRERelationBase, recordRelationBase} from './Base';

type ToType<T> = T extends ENREEntityClass ? ENREEntityClass : (T extends ENREEntityInterface ? ENREEntityClass | ENREEntityInterface : ENREEntityCollectionAll);

export interface ENRERelationExtend<T extends ENREEntityClass | ENREEntityInterface | ENREEntityTypeParameter>
  extends ENRERelationBase {
  readonly type: 'extend',
  readonly from: T,
  readonly to: ToType<T>,
}

export const recordRelationExtend = <T extends ENREEntityClass | ENREEntityInterface | ENREEntityTypeParameter>(
  from: T,
  to: ToType<T>,
  location: ENRELocation,
) => {
  const _base = recordRelationBase(from, to, location);

  const _obj = {
    ..._base,

    get type() {
      return 'extend' as const;
    },
  } as ENRERelationExtend<T>;

  rGraph.add(_obj);

  return _obj;
};
