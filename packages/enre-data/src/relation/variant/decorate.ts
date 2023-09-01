import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENRELocation} from '@enre/location';
import {addAbilityBase, ENRERelationAbilityBase} from '../ability/base';
import {id, recordRelation} from '../../utils/wrapper';

export interface ENRERelationDecorate extends ENRERelationAbilityBase {
  type: 'decorate',
}

export const createRelationDecorate = (
  from: id<ENREEntityCollectionAll>,
  to: id<ENREEntityCollectionAll>,
  location: ENRELocation,
): ENRERelationDecorate => {
  return {
    ...addAbilityBase(from, to, location),

    type: 'decorate',
  };
};

export const recordRelationDecorate = recordRelation(createRelationDecorate);
