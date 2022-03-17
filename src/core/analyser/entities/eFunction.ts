import {ENREEntityBase, recordEntityBase} from './eBase';
import {ENREEntityCollectionAll, ENRELocation} from './index';
import global from '../../utils/global';

export interface ENREEntityFunction extends ENREEntityBase {
  readonly type: 'function';
  readonly isArrowFunction: boolean;
  readonly isAsync: boolean;
  readonly isGenerator: boolean;
}

export const recordEntityFunction = (
  name: string,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
  isArrowFunction = false,
  isAsync = false,
  isGenerator = false,
): ENREEntityFunction => {
  const _base = recordEntityBase(name, location, parent);

  const _obj = {
    ..._base,

    get type() {
      return 'function' as const;
    },

    get isArrowFunction() {
      return isArrowFunction;
    },

    get isAsync() {
      return isAsync;
    },

    get isGenerator() {
      return isGenerator;
    },
  };

  global.eContainer.add(_obj);

  return _obj;
};
