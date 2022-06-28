import {ENREEntityBase, recordEntityBase} from './eBase';
import {ENRELocation} from './index';
import global from '../../utils/global';
import {ENREName} from '../../utils/nameHelper';
import {ENREEntityEnum} from './eEnum';

export interface ENREEntityEnumMember extends ENREEntityBase {
  readonly type: 'enum member';
  readonly value: string | number | undefined;
}

export const recordEntityEnumMember = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityEnum,
  value: ENREEntityEnumMember['value'] = undefined,
): ENREEntityEnumMember => {
  const _base = recordEntityBase(name, location, parent);

  const _obj = {
    ..._base,

    get type() {
      return 'enum member' as const;
    },

    get value() {
      return value;
    },
  };

  global.eContainer.add(_obj);

  return _obj;
};
