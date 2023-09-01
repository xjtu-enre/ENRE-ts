import {ENRELocation} from '@enre/location';
import {addAbilityBase, ENRERelationAbilityBase} from '../ability/base';
import {ENREEntityCollectionInFile} from '../../entity/collections';
import {id, recordRelation} from '../../utils/wrapper';

export interface ENRERelationImplement extends ENRERelationAbilityBase {
  type: 'implement',
}

export const createRelationImplement = (
  from: id<ENREEntityCollectionInFile>,
  to: id<ENREEntityCollectionInFile>,
  location: ENRELocation,
): ENRERelationImplement => {
  return {
    ...addAbilityBase(from, to, location),

    type: 'implement',
  };
};

export const recordRelationImplement = recordRelation(createRelationImplement);
