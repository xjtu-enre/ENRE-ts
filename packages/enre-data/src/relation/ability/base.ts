import {ENRELocation} from '@enre/location';
import {ENREEntityCollectionAll} from '../../entity/collections';
import {id} from '../../utils/wrapper';

// import rGraph from '../container/rContainer';

export interface ENRERelationAbilityBase {
  from: id<ENREEntityCollectionAll>,
  to: id<ENREEntityCollectionAll>,
  location: ENRELocation,
}

export const addAbilityBase = (
  from: id<ENREEntityCollectionAll>,
  to: id<ENREEntityCollectionAll>,
  location: ENRELocation,
): ENRERelationAbilityBase => {
  return {
    from,

    to,

    location,
  };
};
