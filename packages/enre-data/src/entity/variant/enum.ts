import {ENRELocation} from '@enre/location';
import ENREName from '@enre/naming';
import {addAbilityBase, ENREEntityAbilityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../collections';
import {recordEntity} from '../../utils/wrapper';

export interface ENREEntityEnum extends ENREEntityAbilityBase {
  type: 'enum';
  isConst: boolean;
}

export const createEntityEnum = (
  name: ENREName<any>,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
  {
    isConst = false,
  },
): ENREEntityEnum => {
  return {
    ...addAbilityBase(name, location, parent),

    type: 'enum',

    isConst,
  };
};

export const recordEntityEnum = recordEntity(createEntityEnum);
