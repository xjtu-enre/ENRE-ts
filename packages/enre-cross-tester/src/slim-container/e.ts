import ENREName from '@enre/naming';

export interface GeneralEntity {
  id: number,
  name: string | ENREName<any>,
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

type InternalEntity = GeneralEntity & { shallowed: boolean };

const createEntityContainer = () => {
  let _eGraph: Array<InternalEntity> = [];

  return {
    add: (entity: GeneralEntity) => {
      _eGraph.push({...entity, shallowed: false});
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
    where: (predicates: any, ignoreShallow = false) => {
      if (predicates === undefined) {
        return [];
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
          candidate = candidate.filter(e => e.type !== type.slice(1) && (ignoreShallow ? true : !e.shallowed));
        } else {
          candidate = candidate.filter(e => e.type === type && (ignoreShallow ? true : !e.shallowed));
        }
      }

      if (name) {
        if (typeof name === 'string') {
          candidate = candidate.filter(e => ((typeof e.name === 'string' ? e.name : e.name.string) === name) && (ignoreShallow ? true : !e.shallowed));
        } else if (name instanceof RegExp) {
          candidate = candidate.filter(e => name.test((typeof e.name === 'string' ? e.name : e.name.string)) && (ignoreShallow ? true : !e.shallowed));
        }
      }

      if (fullname) {
        candidate = candidate.filter(e => e.getQualifiedName() === fullname && (ignoreShallow ? true : !e.shallowed));
      }

      if (inFile) {
        candidate = candidate.filter(e => e.sourceFile === inFile && (ignoreShallow ? true : !e.shallowed));
      }

      if (startLine) {
        candidate = candidate.filter(e => e.location?.start.line === startLine && (ignoreShallow ? true : !e.shallowed));
      }

      if (startColumn) {
        candidate = candidate.filter(e => e.location?.start.column === startColumn && (ignoreShallow ? true : !e.shallowed));
      }

      if (endLine) {
        candidate = candidate.filter(e => e.location?.end.line === endLine && (ignoreShallow ? true : !e.shallowed));
      }

      if (endColumn) {
        candidate = candidate.filter(e => e.location?.end.column === endColumn && (ignoreShallow ? true : !e.shallowed));
      }

      for (const [k, v] of Object.entries(any)) {
        // @ts-ignore
        candidate = candidate.filter(e => (k in e) && (e[k] === v) && (ignoreShallow ? true : !e.shallowed));
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
