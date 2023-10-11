import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENRELocation} from '@enre/location';
import {addAbilityBase, ENRERelationAbilityBase} from '../ability/base';
import {recordRelation} from '../../utils/wrapper';

export interface ENRERelationCall extends ENRERelationAbilityBase {
  type: 'call',
  isNew: boolean,
}

export const createRelationCall = (
  from: ENREEntityCollectionAll,
  to: ENREEntityCollectionAll,
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
