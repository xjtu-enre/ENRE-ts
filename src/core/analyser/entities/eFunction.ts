import {ENREEntityBase, recordEntityBase} from './eBase';
import {ENREEntityCollectionAll, ENRELocation} from './index';
import global from '../../utils/global';
import {ENREName} from '../../utils/nameHelper';

export interface ENREEntityFunction extends ENREEntityBase {
  readonly type: 'function';
  readonly isArrowFunction: boolean;
  readonly isAsync: boolean;
  readonly isGenerator: boolean;
}

export const recordEntityFunction = (
  name: ENREName,
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

/**
 * TODO: Whether to separate a variable initialized by a function as 2 entities is still discussable
 * Refactor the part of function expression
 */

/**
 * TODO: Function constructor
 * see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/Function
 */
