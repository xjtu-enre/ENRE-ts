import {ENREEntityCollectionAll} from '@enre/container';
import {ENRELocation} from '@enre/location';
import rGraph from '../container/r';
import {ENRERelationBase, recordRelationBase} from './Base';

export interface ENRERelationCall extends ENRERelationBase {
  readonly type: 'call',
}

export const recordRelationCall = (
  from: ENREEntityCollectionAll,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
) => {
  const _base = recordRelationBase(from, to, location);

  const _obj = {
    ..._base,

    get type() {
      return 'call' as const;
    },
  } as ENRERelationCall;

  rGraph.add(_obj);

  return _obj;
};
