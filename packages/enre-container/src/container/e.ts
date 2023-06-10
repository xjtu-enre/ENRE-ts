import {expandENRELocation} from '@enre/location';
import {ENREEntityCollectionAll, ENREEntityTypes} from '../entity/collections';
import {ENREEntityFile} from '../entity/variant/file';

export interface ENREEntityPredicates {
  type?: ENREEntityTypes,
  fullname?: string,
  name?: string | RegExp,
  inFile?: ENREEntityFile | string,
  startLine?: number,
  startColumn?: number,
  endLine?: number,
  endColumn?: number,

  [anyProp: string]: any,
}

const createEntityContainer = () => {
  let _eGraph: Array<ENREEntityCollectionAll> = [];
  let hookOnAdd: ((entity: ENREEntityCollectionAll) => void) | undefined = undefined;
  let lastAdded: ENREEntityCollectionAll | undefined = undefined;

  return {
    get lastAdded() {
      return lastAdded;
    },

    add: (entity: ENREEntityCollectionAll) => {
      _eGraph.push(entity);

      lastAdded = entity;

      hookOnAdd ? hookOnAdd(entity) : undefined;
    },

    set onAdd(hookFunc: (entity: ENREEntityCollectionAll) => void) {
      hookOnAdd = hookFunc;
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
    where: ({
              type,
              name,
              fullname,
              inFile,
              startLine,
              startColumn,
              endLine,
              endColumn,
              ...any
            }: ENREEntityPredicates) => {
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

      if (fullname) {
        candidate = candidate.filter(e => e.fullname === fullname);
      }

      if (typeof inFile === 'object') {
        candidate = candidate.filter(e => e.type !== 'file' && e.sourceFile === inFile);
      } else if (typeof inFile === 'string') {
        // This expects the file name without any directories as input
        candidate = candidate.filter(e => e.type !== 'file' && e.sourceFile.name.codeName === inFile);
      }

      if (startLine) {
        candidate = candidate.filter(e => e.type !== 'file' && e.location.start.line === startLine);
      }

      if (startColumn) {
        candidate = candidate.filter(e => e.type !== 'file' && e.location.start.column === startColumn);
      }

      if (endLine) {
        candidate = candidate.filter(e => e.type !== 'file' && expandENRELocation(e).end.line === endLine);
      }

      if (endColumn) {
        candidate = candidate.filter(e => e.type !== 'file' && expandENRELocation(e).end.column === endColumn);
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
