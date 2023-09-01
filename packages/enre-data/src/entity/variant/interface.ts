import {ENRELocation} from '@enre/location';
import ENREName from '@enre/naming';
import {addAbilityBase, ENREEntityAbilityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../collections';
import {id, recordEntity} from '../../utils/wrapper';

export interface ENREEntityInterface extends ENREEntityAbilityBase {
  type: 'interface';
}

export const createEntityInterface = (
  name: ENREName<any>,
  location: ENRELocation,
  parent: id<ENREEntityCollectionAll>,
): ENREEntityInterface => {
  return {
    ...addAbilityBase(name, location, parent),

    type: 'interface',
  };
};

export const recordEntityInterface = recordEntity(createEntityInterface);
