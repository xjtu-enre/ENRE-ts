import {ENREEntityBase, recordEntityBase} from './eBase';
import {ENREEntityCollectionAll, ENRELocation} from './index';
import global from '../../utils/global';

export interface ENREEntityFunction extends ENREEntityBase {
  readonly type: 'function';
}

export const recordEntityFunction = (
  name: string,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
  isArrowFunction: boolean = false,
): ENREEntityFunction => {
  const _base = recordEntityBase(name, location, parent);

  const _obj = {
    ..._base,

    get type() {
      return 'function' as 'function';
    },

    get isArrowFunction() {
      return isArrowFunction;
    }
  };

  global.eContainer.add(_obj);

  return _obj;
};
