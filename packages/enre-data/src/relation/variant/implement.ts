import {ENRELocation} from '@enre-ts/location';
import {addAbilityBase, ENRERelationAbilityBase} from '../ability/base';
import {ENREEntityCollectionInFile} from '../../entity/collections';
import {recordRelation} from '../../utils/wrapper';

export interface ENRERelationImplement extends ENRERelationAbilityBase {
  type: 'implement',
}

export const createRelationImplement = (
  from: ENREEntityCollectionInFile,
  to: ENREEntityCollectionInFile,
  location: ENRELocation,
): ENRERelationImplement => {
  return {
    ...addAbilityBase(from, to, location),

    type: 'implement',
  };
};

export const recordRelationImplement = recordRelation(createRelationImplement);
