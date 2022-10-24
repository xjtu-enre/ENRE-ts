import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENRELocation} from '@enre/location';
import rGraph from '../../container/r';
import {ENRERelationAbilityBase, recordRelationBase} from '../ability/base';

export interface ENRERelationModify extends ENRERelationAbilityBase {
  readonly type: 'modify',
}

export const recordRelationModify = (
  from: ENREEntityCollectionAll,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
) => {
  const _base = recordRelationBase(from, to, location);

  const _obj = {
    ..._base,

    get type() {
      return 'modify' as const;
    },
  } as ENRERelationModify;

  rGraph.add(_obj);

  return _obj;
};
