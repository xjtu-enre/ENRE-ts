import {GeneralEntity} from './e';

export interface GeneralRelation {
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

const createRelationContainer = () => {
  let _rGraph: Array<GeneralRelation> = [];

  return {
    add: (relation: GeneralRelation) => {
      _rGraph.push(relation);
    },

    get all() {
      return _rGraph;
    },

    where: (predicates: any) => {
      if (predicates === undefined) {
        return undefined;
      }

      const {from, to, type, inFile, line, column} = predicates;

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

      if (inFile) {
        candidate = candidate.filter(r => r.location.file === inFile);
      }

      if (line) {
        candidate = candidate.filter(r => r.location.start.line === line);
      }

      if (column) {
        candidate = candidate.filter(r => r.location.start.column === column);
      }

      return candidate;
    },

    reset: () => {
      _rGraph = [];
    }
  };
};

export default createRelationContainer();
