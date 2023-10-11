import {ENRELocation} from '@enre/location';
import {addAbilityBase, ENRERelationAbilityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../../entity/collections';
import {recordRelation} from '../../utils/wrapper';
import {ENREEntityAlias} from '@enre/data';

export interface ENRERelationAliasof extends ENRERelationAbilityBase {
  type: 'aliasof',
}

export const createRelationAliasof = (
  from: ENREEntityAlias,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
): ENRERelationAliasof => {
  return {
    ...addAbilityBase(from, to, location),

    type: 'aliasof',
  };
};

export const recordRelationAliasof = recordRelation(createRelationAliasof);
