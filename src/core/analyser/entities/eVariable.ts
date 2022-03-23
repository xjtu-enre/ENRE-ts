import {ENREEntityBase, recordEntityBase} from './eBase';
import {ENREEntityCollectionAll, ENRELocation} from './index';
import global from '../../utils/global';
import {ENREName} from '../../utils/nameHelper';

export declare type ENREEntityVariableKind = 'let' | 'const' | 'var';

export interface ENREEntityVariable extends ENREEntityBase {
  readonly type: 'variable';
  readonly kind: ENREEntityVariableKind;
}

export const recordEntityVariable = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
  kind: ENREEntityVariableKind
): ENREEntityVariable => {
  const _base = recordEntityBase(name, location, parent);

  const _obj = {
    ..._base,

    get type() {
      return 'variable' as const;
    },

    get kind() {
      return kind;
    }
  };

  global.eContainer.add(_obj);

  return _obj;
};

/**
 * TODO: Handle assign to a undefined variable will cause a global variable be created.
 * e.g.:
 *  foo();
 *  function foo() { bar = 'baz' } // Define a variable without keyword, and it's global
 *  console.log(bar) // Will output 'baz'
 * see: https://www.w3schools.com/js/js_scope.asp
 */
