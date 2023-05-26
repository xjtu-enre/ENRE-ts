import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENRELocation} from '@enre/location';
import rGraph from '../../container/r';
import {ENRERelationAbilityBase, recordRelationBase} from '../ability/base';

export interface ENRERelationCall extends ENRERelationAbilityBase {
  readonly type: 'call',
}

export const recordRelationCall = (
  from: ENREEntityCollectionAll,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
): ENRERelationCall => {
  const _base = recordRelationBase(from, to, location);

  const _obj = {
    ..._base,

    get type() {
      return 'call' as const;
    },
  };

  rGraph.add(_obj);

  return _obj;
};
