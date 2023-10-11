import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENRELocation} from '@enre/location';
import {addAbilityBase, ENRERelationAbilityBase} from '../ability/base';
import {recordRelation} from '../../utils/wrapper';

export interface ENRERelationDecorate extends ENRERelationAbilityBase {
  type: 'decorate',
}

export const createRelationDecorate = (
  from: ENREEntityCollectionAll,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
): ENRERelationDecorate => {
  return {
    ...addAbilityBase(from, to, location),

    type: 'decorate',
  };
};

export const recordRelationDecorate = recordRelation(createRelationDecorate);
