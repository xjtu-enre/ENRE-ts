import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../container/eContainer';
import {ENREEntityBase, recordEntityBase} from './Base';
import {ENREEntityCollectionAll} from './collections';

export interface ENREEntityTypeParameter extends ENREEntityBase {
  readonly type: 'type parameter';
}

export const recordEntityTypeParameter = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
): ENREEntityTypeParameter => {
  const _base = recordEntityBase(name, location, parent);

  const _obj = {
    ..._base,

    get type() {
      return 'type parameter' as const;
    },
  };

  eGraph.add(_obj);

  return _obj;
};
