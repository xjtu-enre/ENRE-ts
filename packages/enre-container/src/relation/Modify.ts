import {ENREEntityCollectionAll} from '@enre/container';
import {ENRELocation} from '@enre/location';
import rGraph from '../container/r';
import {ENRERelationBase, recordRelationBase} from './Base';

export interface ENRERelationModify extends ENRERelationBase {
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
