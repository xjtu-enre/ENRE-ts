import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENRELocation} from '@enre/location';
import {addAbilityBase, ENRERelationAbilityBase} from '../ability/base';
import {recordRelation} from '../../misc/wrapper';

export interface ENRERelationSet extends ENRERelationAbilityBase {
  type: 'set',
  isInit: boolean,
}

export const createRelationSet = (
  from: ENREEntityCollectionAll,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
  {isInit = false},
) => {
  return {
    ...addAbilityBase(from, to, location),

    type: 'set',

    isInit,
  };
};

export const recordRelationSet = recordRelation(createRelationSet);
