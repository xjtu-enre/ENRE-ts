import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENRELocation} from '@enre/location';
import rGraph from '../../container/r';
import {ENRERelationAbilityBase, recordRelationBase} from '../ability/base';

export interface ENRERelationDecorate extends ENRERelationAbilityBase {
  readonly type: 'decorate',
}

export const recordRelationDecorate = (
  from: ENREEntityCollectionAll,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
): ENRERelationDecorate => {
  const _base = recordRelationBase(from, to, location);

  const _obj = {
    ..._base,

    get type() {
      return 'decorate' as const;
    },
  };

  rGraph.add(_obj);

  return _obj;
};
