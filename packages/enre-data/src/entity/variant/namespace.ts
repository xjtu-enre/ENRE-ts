import {ENRELocation} from '@enre-ts/location';
import ENREName from '@enre-ts/naming';
import {addAbilityBase, ENREEntityAbilityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../collections';
import {
  addAbilityImportExport,
  ENREEntityAbilityImportExport
} from '../ability/import-export';
import {recordEntity} from '../../utils/wrapper';

export interface ENREEntityNamespace extends ENREEntityAbilityBase, ENREEntityAbilityImportExport {
  type: 'namespace';
}

export const createEntityNamespace = (
  name: ENREName<any>,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
): ENREEntityNamespace => {
  return {
    ...addAbilityBase(name, location, parent),

    ...addAbilityImportExport(),

    type: 'namespace',
  };
};

export const recordEntityNamespace = recordEntity(createEntityNamespace);
