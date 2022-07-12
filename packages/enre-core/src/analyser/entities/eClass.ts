import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from './container';
import {ENREEntityBase, recordEntityBase} from './eBase';
import {ENREEntityCollectionAll} from './index';

export interface ENREEntityClass extends ENREEntityBase {
  readonly type: 'class';
}

export const recordEntityClass = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
): ENREEntityClass => {
  const _base = recordEntityBase(name, location, parent);

  const _obj = {
    ..._base,

    get type() {
      return 'class' as const;
    },
  };

  eGraph.add(_obj);

  return _obj;
};
