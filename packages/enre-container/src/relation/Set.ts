import {ENREEntityCollectionAll} from '@enre/container';
import {ENRELocation} from '@enre/location';
import rGraph from '../container/r';
import {ENRERelationBase, recordRelationBase} from './Base';

export interface ENRERelationSet extends ENRERelationBase {
  readonly type: 'set',
  readonly isInit: boolean,
}

export const recordRelationSet = (
  from: ENREEntityCollectionAll,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
  init = false,
) => {
  const _base = recordRelationBase(from, to, location);

  const _obj = {
    ..._base,

    get type() {
      return 'set' as const;
    },

    get isInit() {
      return init;
    },
  } as ENRERelationSet;

  rGraph.add(_obj);

  return _obj;
};
