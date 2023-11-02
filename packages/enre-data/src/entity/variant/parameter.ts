import {ENRELocation} from '@enre/location';
import ENREName from '@enre/naming';
import {addAbilityBase, ENREEntityAbilityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../collections';
import {recordEntity} from '../../utils/wrapper';

export interface ENREEntityParameter extends ENREEntityAbilityBase {
  type: 'parameter',
  path: any[],
}

export const createEntityParameter = (
  name: ENREName<any>,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
  {path}: Pick<ENREEntityParameter, 'path'>,
): ENREEntityParameter => {
  return {
    ...addAbilityBase(name, location, parent),

    type: 'parameter',

    path,
  };
};

export const recordEntityParameter = recordEntity(createEntityParameter);
