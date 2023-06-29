import {ENRELocation} from '@enre/location';
import {ENREEntityCollectionAll} from '../../entity/collections';

// import rGraph from '../container/rContainer';

export interface ENRERelationAbilityBase {
  from: ENREEntityCollectionAll,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
}

export const addAbilityBase = (
  from: ENREEntityCollectionAll,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
): ENRERelationAbilityBase => {
  return {
    from,

    to,

    location,
  };
};
