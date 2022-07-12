import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from './container';
import {ENREEntityBase, recordEntityBase} from './eBase';
import {ENREEntityCollectionAll} from './index';

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

  eGraph.add(_obj);

  return _obj;
};
