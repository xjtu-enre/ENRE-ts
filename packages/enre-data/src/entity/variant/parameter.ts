import {ENRELocation} from '@enre-ts/location';
import ENREName from '@enre-ts/naming';
import {addAbilityBase, ENREEntityAbilityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../collections';
import {recordEntity} from '../../utils/wrapper';

export interface ENREEntityParameter extends ENREEntityAbilityBase {
  type: 'parameter',
  path: any[],
  defaultAlter: any,
}

export const createEntityParameter = (
  name: ENREName<any>,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
  {path, defaultAlter}: Pick<ENREEntityParameter, 'path' | 'defaultAlter'>,
): ENREEntityParameter => {
  return {
    ...addAbilityBase(name, location, parent),

    type: 'parameter',

    path,

    defaultAlter,
  };
};

export const recordEntityParameter = recordEntity(createEntityParameter);
