import {ENRELocation} from '@enre/location';
import ENREName from '@enre/naming';
import {addAbilityBase, ENREEntityAbilityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../collections';
import {ENRERelationImport} from '../../relation/variant/import';
import {ENRERelationExport} from '../../relation/variant/export';
import {recordEntity} from '../../misc/wrapper';

type Aliasable = ENRERelationImport | ENRERelationExport

export interface ENREEntityAlias<T extends Aliasable = Aliasable> extends ENREEntityAbilityBase {
  type: 'alias';
  /**
   * The reverse link to the import/export relation that creates this alias entity.
   *
   * The binding is automatically performed (in the relation side).
   */
  ofRelation: T;
}

export const createEntityAlias = <T extends Aliasable>(
  name: ENREName<any>,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
): ENREEntityAlias<T> => {
  let ofRelation: T;

  return {
    ...addAbilityBase(name, location, parent),

    type: 'alias',

    set ofRelation(value) {
      ofRelation = value;
    },

    get ofRelation() {
      return ofRelation;
    },
  };
};

export const recordEntityAlias = recordEntity(createEntityAlias);
