import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENRELocation} from '@enre/location';
import {addAbilityBase, ENRERelationAbilityBase} from '../ability/base';
import {id, recordRelation} from '../../utils/wrapper';

export interface ENRERelationUse extends ENRERelationAbilityBase {
  type: 'use',
}

export const createRelationUse = (
  from: id<ENREEntityCollectionAll>,
  to: id<ENREEntityCollectionAll>,
  location: ENRELocation,
): ENRERelationUse => {
  return {
    ...addAbilityBase(from, to, location),

    type: 'use',
  };
};

export const recordRelationUse = recordRelation(createRelationUse);
