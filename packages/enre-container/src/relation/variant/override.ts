import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENRELocation} from '@enre/location';
import rGraph from '../../container/r';
import {ENRERelationAbilityBase, recordRelationBase} from '../ability/base';

export interface ENRERelationOverride extends ENRERelationAbilityBase {
  readonly type: 'override',
}

export const recordRelationOverride = (
  from: ENREEntityCollectionAll,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
) => {
  const _base = recordRelationBase(from, to, location);

  const _obj = {
    ..._base,

    get type() {
      return 'override' as const;
    },
  } as ENRERelationOverride;

  rGraph.add(_obj);

  return _obj;
};
