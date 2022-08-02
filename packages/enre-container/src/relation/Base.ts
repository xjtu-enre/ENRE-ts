import {ENREEntityCollectionAll} from '../entity/collections';

// import rGraph from '../container/rContainer';

export interface ENRERelationBase {
  readonly from: ENREEntityCollectionAll,
  readonly to: ENREEntityCollectionAll,
  // TODO: Create a new data structure for relation location or provide unified locations used in entity and relation.
  readonly location: string,
}

export const recordRelationBase = (
  from: ENREEntityCollectionAll,
  to: ENREEntityCollectionAll,
  location: string,
): ENRERelationBase => {
  return {
    get from() {
      return from;
    },

    get to() {
      return to;
    },

    get location() {
      return 'TODO';
    },
  };
};
