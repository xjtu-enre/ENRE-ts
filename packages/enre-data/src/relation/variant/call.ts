import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENRELocation} from '@enre/location';
import {addAbilityBase, ENRERelationAbilityBase} from '../ability/base';
import {id, recordRelation} from '../../utils/wrapper';

export interface ENRERelationCall extends ENRERelationAbilityBase {
  type: 'call',
  isNew: boolean,
}

export const createRelationCall = (
  from: id<ENREEntityCollectionAll>,
  to: id<ENREEntityCollectionAll>,
  location: ENRELocation,
  {
    isNew = false,
  }: Pick<ENRERelationCall, 'isNew'>,
): ENRERelationCall => {
  return {
    ...addAbilityBase(from, to, location),

    type: 'call',

    isNew,
  };
};

export const recordRelationCall = recordRelation(createRelationCall);
