import {ENRELocation} from '@enre/location';
import ENREName from '@enre/naming';
import {addAbilityBase, ENREEntityAbilityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../collections';
import {recordEntity} from '../../misc/wrapper';

export interface ENREEntityParameter extends ENREEntityAbilityBase {
  type: 'parameter',
  // TODO: Path should be rich object
  path: string,
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
