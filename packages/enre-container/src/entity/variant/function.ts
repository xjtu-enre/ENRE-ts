import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../../container/e';
import {ENREEntityAbilityBase, recordEntityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../collections';
import {ENREEntityAbilityFunctionLike} from '../ability/function-like';

export interface ENREEntityFunction extends ENREEntityAbilityBase, ENREEntityAbilityFunctionLike {
  readonly type: 'function';
  readonly isArrowFunction: boolean;
}

export const recordEntityFunction = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
  {
    isArrowFunction = false,
    isAsync = false,
    isGenerator = false,
  },
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

  eGraph.add(_obj);

  return _obj;
};
