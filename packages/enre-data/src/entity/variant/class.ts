import {ENRELocation} from '@enre/location';
import ENREName from '@enre/naming';
import {addAbilityBase, ENREEntityAbilityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../collections';
import {addAbilityAbstractable, ENREEntityAbilityAbstractable} from '../ability/abstractable';
import {recordEntity} from '../../utils/wrapper';

export interface ENREEntityClass extends ENREEntityAbilityBase, ENREEntityAbilityAbstractable {
  type: 'class';
}

export const createEntityClass = (
  name: ENREName<any>,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
  {
    isAbstract = false,
  },
): ENREEntityClass => {
  return {
    ...addAbilityBase(name, location, parent),

    ...addAbilityAbstractable(isAbstract),

    type: 'class',
  };
};

export const recordEntityClass = recordEntity(createEntityClass);
