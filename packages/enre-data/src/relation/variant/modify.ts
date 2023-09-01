import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENRELocation} from '@enre/location';
import {addAbilityBase, ENRERelationAbilityBase} from '../ability/base';
import {id, recordRelation} from '../../utils/wrapper';

export interface ENRERelationModify extends ENRERelationAbilityBase {
  type: 'modify',
}

export const createRelationModify = (
  from: id<ENREEntityCollectionAll>,
  to: id<ENREEntityCollectionAll>,
  location: ENRELocation,
) => {
  return {
    ...addAbilityBase(from, to, location),

    type: 'modify',
  };
};

export const recordRelationModify = recordRelation(createRelationModify);
