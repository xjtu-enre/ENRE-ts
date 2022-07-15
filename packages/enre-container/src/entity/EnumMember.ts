import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../container/eContainer';
import {ENREEntityBase, recordEntityBase} from './Base';
import {ENREEntityEnum} from './Enum';

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

  eGraph.add(_obj);

  return _obj;
};
