import {ENRELocation} from '@enre/location';
import {ENREEntityCollectionAll} from '../../entity/collections';

// import rGraph from '../container/rContainer';

export interface ENRERelationAbilityBase {
  from: ENREEntityCollectionAll,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
  // isImplicit: boolean,
}

export const addAbilityBase = (
  from: ENREEntityCollectionAll,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
  // isImplicit = false,
): ENRERelationAbilityBase => {
  return {
    from,

    to,

    location,

    // isImplicit,
  };
};
