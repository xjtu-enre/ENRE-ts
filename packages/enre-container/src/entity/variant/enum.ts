import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../../container/e';
import {ENREEntityAbilityBase, recordEntityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../collections';
import {ENREEntityEnumMember} from './enum-member';
import {ENREEntityAbilityMultiDeclarable} from '../ability/multideclarable';

export interface ENREEntityEnum extends ENREEntityAbilityBase<ENREEntityCollectionAll, ENREEntityEnumMember>, ENREEntityAbilityMultiDeclarable {
  readonly type: 'enum';
  readonly isConst: boolean;
}

export const recordEntityEnum = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
  {
    isConst = false,
  },
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
