import {ENRELocation} from '@enre-ts/location';
import {addAbilityBase, ENRERelationAbilityBase} from '../ability/base';
import {ENREEntityCollectionInFile} from '../../entity/collections';
import {recordRelation} from '../../utils/wrapper';

// type ToType<T> = T extends ENREEntityClass ? ENREEntityClass : (T extends ENREEntityInterface ? ENREEntityClass | ENREEntityInterface : ENREEntityCollectionAll);

export interface ENRERelationExtend extends ENRERelationAbilityBase {
  type: 'extend',
}

export const createRelationExtend = (
  from: ENREEntityCollectionInFile,
  to: ENREEntityCollectionInFile,
  location: ENRELocation,
): ENRERelationExtend => {
  return {
    ...addAbilityBase(from, to, location),

    type: 'extend',
  };
};

export const recordRelationExtend = recordRelation(createRelationExtend);
