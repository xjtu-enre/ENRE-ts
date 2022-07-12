import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from './container';
import {ENREEntityBase, recordEntityBase} from './eBase';
import {ENREEntityEnumMember} from './eEnumMember';
import {ENREEntityCollectionAll} from './index';

export interface ENREEntityEnum extends ENREEntityBase {
  readonly type: 'enum';
  readonly isConst: boolean;
  members: {
    add: (entity: ENREEntityEnumMember) => void,
    get: () => Array<ENREEntityEnumMember>,
  };
}

export const recordEntityEnum = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
  isConst = false,
): ENREEntityEnum => {
  const _base = recordEntityBase(name, location, parent);

  const _members: Array<ENREEntityEnumMember> = [];

  const _obj = {
    ..._base,

    get type() {
      return 'enum' as const;
    },

    get isConst() {
      return isConst;
    },

    members: {
      add: (entity: ENREEntityEnumMember) => {
        _members.push(entity);
      },

      get: () => {
        return _members;
      }
    }
  };

  eGraph.add(_obj);

  return _obj;
};
