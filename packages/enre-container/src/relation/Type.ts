import {ENREEntityCollectionAll} from '@enre/container';
import {ENRELocation} from '@enre/location';
import rGraph from '../container/r';
import {ENRERelationBase, recordRelationBase} from './Base';

export interface ENRERelationType extends ENRERelationBase {
  readonly type: 'type',
}

export const recordRelationType = (
  from: ENREEntityCollectionAll,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
) => {
  const _base = recordRelationBase(from, to, location);

  const _obj = {
    ..._base,

    get type() {
      return 'type' as const;
    },
  } as ENRERelationType;

  rGraph.add(_obj);

  return _obj;
};
