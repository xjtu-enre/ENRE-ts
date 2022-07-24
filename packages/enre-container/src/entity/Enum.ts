import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../container/eContainer';
import {ENREEntityBase, recordEntityBase} from './Base';
import {ENREEntityCollectionAll} from './collections';
import {ENREEntityEnumMember} from './EnumMember';

export interface ENREEntityEnum extends ENREEntityBase<ENREEntityCollectionAll, ENREEntityEnumMember> {
  readonly type: 'enum';
  readonly declarations: Array<ENRELocation>;
  readonly isConst: boolean;
}

export const recordEntityEnum = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
  isConst = false,
): ENREEntityEnum => {
  const _base = recordEntityBase<ENREEntityCollectionAll, ENREEntityEnumMember>(name, location, parent);
  const _declarations: Array<ENRELocation> = [];

  const _obj = {
    ..._base,

    get type() {
      return 'enum' as const;
    },

    get isConst() {
      return isConst;
    },

    get declarations() {
      return _declarations;
    },
  };

  eGraph.add(_obj);

  return _obj;
};
