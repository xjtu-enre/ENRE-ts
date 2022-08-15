import {ENREName} from '@enre/naming';

export interface GeneralEntity {
  id: number,
  name: string | ENREName,
  fullname: string,
  type: string,
  sourceFile?: GeneralEntity,
  location?: {
    start: {
      line: number,
      column: number,
    },
    end: {
      line: number,
      column: number,
    }
  },

  [index: string]: any,
}

const createEntityContainer = () => {
  let _eGraph: Array<GeneralEntity> = [];

  return {
    add: (entity: GeneralEntity) => {
      _eGraph.push(entity);
    },

    get all() {
      return _eGraph;
    },

    /**
     * If the id is strictly assigned by length,
     * then this could be changed to index access.
     */
    getById: (id: number) => {
      return _eGraph.find(e => e.id === id);
    },

    /**
     * Find entity(s) according to the type and name,
     * params cannot be both undefined.
     */
    where: (predicates: any) => {
      if (predicates === undefined) {
        return undefined;
      }

      const {
        type,
        name,
        fullname,
        inFile,
        startLine,
        startColumn,
        endLine,
        endColumn,
        ...any
      } = predicates;

      let candidate = _eGraph;

      if (type) {
        if (type.startsWith('!')) {
          candidate = candidate.filter(e => e.type !== type.slice(1));
        } else {
          candidate = candidate.filter(e => e.type === type);
        }
      }

      if (name) {
        if (typeof name === 'string') {
          candidate = candidate.filter(e => (typeof e.name === 'string' ? e.name : e.name.printableName) === name);
        } else if (name instanceof RegExp) {
          candidate = candidate.filter(e => name.test((typeof e.name === 'string' ? e.name : e.name.printableName)));
        }
      }

      if (fullname) {
        candidate = candidate.filter(e => e.fullname === fullname);
      }

      if (inFile) {
        candidate = candidate.filter(e => e.sourceFile === inFile);
      }

      if (startLine) {
        candidate = candidate.filter(e => e.location?.start.line === startLine);
      }

      if (startColumn) {
        candidate = candidate.filter(e => e.location?.start.column === startColumn);
      }

      if (endLine) {
        candidate = candidate.filter(e => e.location?.end.line === endLine);
      }

      if (endColumn) {
        candidate = candidate.filter(e => e.location?.end.column === endColumn);
      }

      for (const [k, v] of Object.entries(any)) {
        // @ts-ignore
        candidate = candidate.filter(e => k in e && e[k] === v);
      }

      return candidate;
    },


    reset: () => {
      _eGraph = [];
    }
  };
};

/**
 * By invoking immediately, anywhere else in a single run
 * will gain access to this single global instance.
 */
export default createEntityContainer();
