import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENRELocation} from '@enre/location';
import {addAbilityBase, ENRERelationAbilityBase} from '../ability/base';
import {id, recordRelation} from '../../utils/wrapper';

export interface ENRERelationType extends ENRERelationAbilityBase {
  type: 'type',
}

export const createRelationType = (
  from: id<ENREEntityCollectionAll>,
  to: id<ENREEntityCollectionAll>,
  location: ENRELocation,
) => {
  return {
    ...addAbilityBase(from, to, location),

    type: 'type',
  };
};

export const recordRelationType = recordRelation(createRelationType);