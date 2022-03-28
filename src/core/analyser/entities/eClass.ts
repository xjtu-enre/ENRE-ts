import {ENREEntityBase, recordEntityBase} from './eBase';
import {ENREEntityCollectionAll, ENRELocation} from './index';
import global from '../../utils/global';
import {ENREName} from '../../utils/nameHelper';

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

  global.eContainer.add(_obj);

  return _obj;
};
