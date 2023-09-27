import {ENRELocation} from '@enre/location';
import {addAbilityBase, ENRERelationAbilityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../../entity/collections';
import {id, recordRelation} from '../../utils/wrapper';
import {ENREEntityAlias} from '@enre/data';

export interface ENRERelationAliasof extends ENRERelationAbilityBase {
  type: 'aliasof',
}

export const createRelationAliasof = (
  from: id<ENREEntityAlias>,
  to: id<ENREEntityCollectionAll>,
  location: ENRELocation,
): ENRERelationAliasof => {
  return {
    ...addAbilityBase(from, to, location),

    type: 'aliasof',
  };
};

export const recordRelationAliasof = recordRelation(createRelationAliasof);
