import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENRELocation} from '@enre/location';
import {addAbilityBase, ENRERelationAbilityBase} from '../ability/base';
import {recordRelation} from '../../misc/wrapper';

export interface ENRERelationOverride extends ENRERelationAbilityBase {
  type: 'override',
}

export const createRelationOverride = (
  from: ENREEntityCollectionAll,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
) => {
  return {
    ...addAbilityBase(from, to, location),

    type: 'override',
  };
};

export const recordRelationOverride = recordRelation(createRelationOverride);
