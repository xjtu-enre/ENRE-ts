import {ENREEntityCollectionAll} from '../entity/collections';
import {ENREEntityFile} from '../entity/structure/file';
import {ENRERelationCollectionAll, ENRERelationTypes} from '../relation/collections';

export interface ENRERelationPredicates {
  from?: ENREEntityCollectionAll,
  to?: ENREEntityCollectionAll,
  type?: ENRERelationTypes,
  startLine?: number,
}

const createRelationContainer = () => {
  let _r: Array<ENRERelationCollectionAll> = [];

  return {
    add: (relation: ENRERelationCollectionAll) => {
      _r.push(relation);

      /**
       * Add imports/exports to file entity's attributes,
       * this can only be done here, since the export relation
       * can be made in various places.
       */
      if (relation.type === 'import') {
        (relation.from as ENREEntityFile).imports.push(relation);
      } else if (relation.type === 'export') {
        (relation.from as ENREEntityFile).exports.push(relation);
      }
    },

    get all() {
      return _r;
    },

    where: ({from, to, type, startLine}: ENRERelationPredicates) => {
      if (!from && !to && !type) {
        return undefined;
      }

      let candidate = _r;

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

      if (startLine) {
        candidate = candidate.filter(r => r.location.start.line === startLine);
      }

      return candidate;
    },

    reset: () => {
      _r = [];
    }
  };
};

export default createRelationContainer();
