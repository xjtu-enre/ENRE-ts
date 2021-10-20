import {ENREEntityBase, recordEntityBase} from './eBase';
import {ENREEntityAll, ENRECodeLocation} from './index';
import global from '../../utils/global';

export declare type variableKind = 'let' | 'const' | 'var';

export interface ENREEntityVariable extends ENREEntityBase {
  readonly kind: variableKind;
}

export const recordEntityVariable = (
  name: string,
  location: ENRECodeLocation,
  parent: ENREEntityAll,
  kind: variableKind
): ENREEntityVariable => {
  const _base = recordEntityBase(name, location, parent);

  const _obj = {
    ..._base,

    get kind() {
      return kind;
    }
  };

  global.eContainer.add(_obj);

  return _obj;
};
