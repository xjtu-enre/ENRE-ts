import {ENREEntityBase, recordEntityBase} from './eBase';
import {ENREEntityCollectionAll, ENRELocation} from './index';
import global from '../../utils/global';

export declare type ENREEntityVariableKind = 'let' | 'const' | 'var';

export interface ENREEntityVariable extends ENREEntityBase {
  readonly type: 'variable';
  readonly kind: ENREEntityVariableKind;
}

export const recordEntityVariable = (
  name: string,
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
