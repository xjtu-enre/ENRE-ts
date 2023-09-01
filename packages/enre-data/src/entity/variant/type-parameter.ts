import {ENRELocation} from '@enre/location';
import ENREName from '@enre/naming';
import {addAbilityBase, ENREEntityAbilityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../collections';
import {id, recordEntity} from '../../utils/wrapper';

export interface ENREEntityTypeParameter extends ENREEntityAbilityBase {
  type: 'type parameter';
  isConst: boolean;
}

export const createEntityTypeParameter = (
  name: ENREName<any>,
  location: ENRELocation,
  parent: id<ENREEntityCollectionAll>,
  {
    isConst = false,
  },
): ENREEntityTypeParameter => {
  return {
    ...addAbilityBase(name, location, parent),

    type: 'type parameter',

    isConst,
  };
};

export const recordEntityTypeParameter = recordEntity(createEntityTypeParameter);
