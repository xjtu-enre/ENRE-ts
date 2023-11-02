import {ENRELocation} from '@enre/location';
import {ENREEntityCollectionAll} from '../../entity/collections';

export interface ENRERelationAbilityBase {
  from: ENREEntityCollectionAll,
  to: ENREEntityCollectionAll,
  location: ENRELocation,

  /**
   * This indicates an implicit relation, default is `false` (explicit relation).
   * It cannot be set by passing arguments, but direct modify returned relation object through
   * `relation.isImplicit = true`.
   */
  isImplicit: boolean,
}

export const addAbilityBase = (
  from: ENREEntityCollectionAll,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
): ENRERelationAbilityBase => {
  return {
    from,

    to,

    location,

    isImplicit: false,
  };
};
