import {ENRELocation} from '@enre/location';
import {addAbilityBase, ENRERelationAbilityBase} from '../ability/base';
import {ENREEntityCollectionInFile} from '../../entity/collections';
import {id, recordRelation} from '../../utils/wrapper';

// type ToType<T> = T extends ENREEntityClass ? ENREEntityClass : (T extends ENREEntityInterface ? ENREEntityClass | ENREEntityInterface : ENREEntityCollectionAll);

export interface ENRERelationExtend extends ENRERelationAbilityBase {
  type: 'extend',
}

export const createRelationExtend = (
  from: id<ENREEntityCollectionInFile>,
  to: id<ENREEntityCollectionInFile>,
  location: ENRELocation,
): ENRERelationExtend => {
  return {
    ...addAbilityBase(from, to, location),

    type: 'extend',
  };
};

export const recordRelationExtend = recordRelation(createRelationExtend);
