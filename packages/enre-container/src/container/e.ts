import {ENREEntityCollectionAll, ENREEntityTypes} from '../entity/collections';

export interface ENREEntityPredicates {
  type?: ENREEntityTypes,
  name?: string | RegExp,
  startLine?: number,

  [anyProp: string]: any,
}

const createEntityContainer = () => {
  let _eGraph: Array<ENREEntityCollectionAll> = [];

  return {
    add: (entity: ENREEntityCollectionAll) => {
      _eGraph.push(entity);
    },

    get all() {
      return _eGraph;
    },

    get nextId() {
      return _eGraph.length;
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
    where: ({type, name, startLine, ...any}: ENREEntityPredicates) => {
      if (!type && !name) {
        return undefined;
      }

      let candidate = _eGraph;

      if (type) {
        if (type.startsWith('!')) {
          candidate = candidate.filter(e => e.type !== type.slice(1));
        } else {
          candidate = candidate.filter(e => e.type === type);
        }
      }

      if (typeof name === 'string') {
        candidate = candidate.filter(e => (typeof e.name === 'string' ? e.name : e.name.printableName) === name);
      } else if (name instanceof RegExp) {
        candidate = candidate.filter(e => name.test((typeof e.name === 'string' ? e.name : e.name.printableName)));
      }

      if (startLine) {
        candidate = candidate.filter(e => e.type !== 'file' && e.location.start.line === startLine);
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
