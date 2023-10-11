import {ENRELocation} from '@enre/location';
import ENREName from '@enre/naming';
import {addAbilityBase, ENREEntityAbilityBase} from '../ability/base';
import {ENREEntityEnum} from './enum';
import {recordEntity} from '../../utils/wrapper';

export interface ENREEntityEnumMember extends ENREEntityAbilityBase {
  type: 'enum member';
  value: string | number | undefined;
}

export const createEntityEnumMember = (
  name: ENREName<any>,
  location: ENRELocation,
  parent: ENREEntityEnum,
  {
    value = undefined,
  },
): ENREEntityEnumMember => {

  return {
    ...addAbilityBase(name, location, parent),

    type: 'enum member',

    value,
  };
};

export const recordEntityEnumMember = recordEntity(createEntityEnumMember);
