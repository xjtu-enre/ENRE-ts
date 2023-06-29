import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENRELocation} from '@enre/location';
import {addAbilityBase, ENRERelationAbilityBase} from '../ability/base';
import {recordRelation} from '../../misc/wrapper';

export interface ENRERelationCall extends ENRERelationAbilityBase {
  type: 'call',
}

export const createRelationCall = (
  from: ENREEntityCollectionAll,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
): ENRERelationCall => {
  return {
    ...addAbilityBase(from, to, location),

    type: 'call',
  };
};

export const recordRelationCall = recordRelation(createRelationCall);
