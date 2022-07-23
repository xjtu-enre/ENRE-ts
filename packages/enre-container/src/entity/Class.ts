import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../container/eContainer';
import {ENREEntityBase, recordEntityBase} from './Base';
import {ENREEntityCollectionAll} from './collections';

export interface ENREEntityClass extends ENREEntityBase {
  readonly type: 'class';
  readonly isAbstract: boolean;
}

export const recordEntityClass = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
  isAbstract = false,
): ENREEntityClass => {
  const _base = recordEntityBase(name, location, parent);

  const _obj = {
    ..._base,

    get type() {
      return 'class' as const;
    },

    get isAbstract() {
      return isAbstract;
    }
  };

  eGraph.add(_obj);

  return _obj;
};
