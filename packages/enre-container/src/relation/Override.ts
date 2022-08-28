import {ENREEntityCollectionAll} from '@enre/container';
import {ENRELocation} from '@enre/location';
import rGraph from '../container/r';
import {ENRERelationBase, recordRelationBase} from './Base';

export interface ENRERelationOverride extends ENRERelationBase {
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
