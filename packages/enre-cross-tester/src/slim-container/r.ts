import {GeneralEntity} from './e';

export interface GeneralRelation {
  id: number,

  from: GeneralEntity,
  to: GeneralEntity,
  type: string,
  location: {
    file: GeneralEntity,
    start: {
      line: number,
      column: number,
    },
  },

  [index: string]: any,
}

type InternalRelation = GeneralRelation & { shallowed: boolean };

const createRelationContainer = () => {
  let _rGraph: Array<InternalRelation> = [];

  return {
    add: (relation: GeneralRelation) => {
      _rGraph.push({...relation, shallowed: false,});
    },

    get all() {
      return _rGraph;
    },

    where: (predicates: any, ignoreShallow = false) => {
      if (predicates === undefined) {
        return [];
      }

      const {from, to, type, inFile, line, column} = predicates;

      let candidate = _rGraph;

      if (type) {
        candidate = candidate.filter(r => r.type === type && (ignoreShallow ? true : !r.shallowed));
      }

      if (from) {
        /**
         * This equality checks whether r.from and from refer to the same location in the memory.
         */
        candidate = candidate.filter(r => r.from === from && (ignoreShallow ? true : !r.shallowed));
      }

      if (to) {
        candidate = candidate.filter(r => r.to === to && (ignoreShallow ? true : !r.shallowed));
      }

      if (inFile) {
        candidate = candidate.filter(r => r.location.file === inFile && (ignoreShallow ? true : !r.shallowed));
      }

      if (line) {
        candidate = candidate.filter(r => r.location.start.line === line && (ignoreShallow ? true : !r.shallowed));
      }

      if (column) {
        candidate = candidate.filter(r => r.location.start.column === column && (ignoreShallow ? true : !r.shallowed));
      }

      if (candidate.length === 1) {
        candidate[0].shallowed = true;
      }

      return candidate;
    },

    reset: () => {
      _rGraph = [];
    }
  };
};

export default createRelationContainer();
