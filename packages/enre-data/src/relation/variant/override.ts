import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENRELocation} from '@enre/location';
import {addAbilityBase, ENRERelationAbilityBase} from '../ability/base';
import {id, recordRelation} from '../../utils/wrapper';

export interface ENRERelationOverride extends ENRERelationAbilityBase {
  type: 'override',
}

export const createRelationOverride = (
  from: id<ENREEntityCollectionAll>,
  to: id<ENREEntityCollectionAll>,
  location: ENRELocation,
) => {
  return {
    ...addAbilityBase(from, to, location),

    type: 'override',
  };
};

export const recordRelationOverride = recordRelation(createRelationOverride);
