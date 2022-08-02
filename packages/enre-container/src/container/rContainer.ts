import {ENREEntityCollectionAll} from '@enre/container';
import {ENRERelationCollectionAll, ENRERelationTypes} from '../relation/collections';

export interface ENRERelationPredicates {
  from?: ENREEntityCollectionAll,
  to?: ENREEntityCollectionAll,
  type?: ENRERelationTypes,
}

const createRelationContainer = () => {
  let _rGraph: Array<ENRERelationCollectionAll>;

  return {
    add: (relation: ENRERelationCollectionAll) => {
      _rGraph.push(relation);
    },

    get all() {
      return _rGraph;
    },

    where: ({from, to, type}: ENRERelationPredicates) => {
      if (!from && !to && !type) {
        return undefined;
      }

      let candidate = _rGraph;

      if (type) {
        candidate = candidate.filter(r => r.type === type);
      }

      if (from) {
        /**
         * This equality checks whether r.from and from refer to the same location in the memory.
         */
        candidate = candidate.filter(r => r.from === from);
      }

      if (to) {
        candidate = candidate.filter(r => r.to === to);
      }

      return candidate;
    },

    reset: () => {
      _rGraph = [];
    }
  };
};

export default createRelationContainer();
