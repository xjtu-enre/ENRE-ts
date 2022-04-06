import {ENREEntityBase, recordEntityBase} from './eBase';
import {ENREEntityCollectionAll, ENRELocation} from './index';
import global from '../../utils/global';
import {ENREName} from '../../utils/nameHelper';

export interface ENREEntityField extends ENREEntityBase {
  readonly type: 'field';
  readonly isStatic: boolean;
  readonly isPrivate: boolean;
  /**
   * `Implicit` indicates this field is created through `this.*`,
   * which might not be presented at up-front class fields.
   */
  readonly isImplicit: boolean;
}

export const recordEntityField = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
  isStatic = false,
  isPrivate = false,
  isImplicit = false,
): ENREEntityField => {
  const _base = recordEntityBase(name, location, parent);

  const _obj = {
    ..._base,

    get type() {
      return 'field' as const;
    },

    get isStatic() {
      return isStatic;
    },

    get isPrivate() {
      return isPrivate;
    },

    get isImplicit() {
      return isImplicit;
    }
  };

  global.eContainer.add(_obj);

  return _obj;
};
