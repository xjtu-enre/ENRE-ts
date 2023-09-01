import {expandENRELocation} from '@enre/location';
import {ENREEntityCollectionAll, ENREEntityTypes} from '../entity/collections';
import {ENREEntityFile} from '../entity/structure/file';
import {id} from '../utils/wrapper';

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
  let _e: Array<id<ENREEntityCollectionAll>> = [];
  const counter = {
    /**
     * id of user-defined entities increment from 0 by 1.
     */
    firstParty: -1,
    /**
     * id of built-in/third-party entities decrement from -1 by 1.
     */
    thirdParty: 0,
  };
  let hookOnAdd: ((entity: id<ENREEntityCollectionAll>) => void) | undefined = undefined;
  let lastAdded: id<ENREEntityCollectionAll> | undefined = undefined;

  return {
    get lastAdded() {
      return lastAdded;
    },

    add: (entity: ENREEntityCollectionAll, party: 'first' | 'third') => {
      const id = (counter[`${party}Party`] += 1 * (party === 'third' ? -1 : 1));
      const _entity = Object.defineProperty(entity, 'id', {value: id}) as id<ENREEntityCollectionAll>;

      _e.push(_entity);

      lastAdded = _entity;

      hookOnAdd ? hookOnAdd(_entity) : undefined;
    },

    set onAdd(hookFunc: (entity: id<ENREEntityCollectionAll>) => void) {
      hookOnAdd = hookFunc;
    },

    get all() {
      return _e;
    },

    getById: (id: number) => {
      return _e.find(e => e.id === id);
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
      let candidate = _e;

      const haveLocation = (entity: ENREEntityCollectionAll) => {
        return ['package', 'file'].indexOf(entity.type) !== -1;
      };

      if (type) {
        if (type.startsWith('!')) {
          candidate = candidate.filter(e => e.type !== type.slice(1));
        } else {
          candidate = candidate.filter(e => e.type === type);
        }
      }

      if (typeof name === 'string') {
        candidate = candidate.filter(e => (typeof e.name === 'string' ? e.name : e.name.string) === name);
      } else if (name instanceof RegExp) {
        candidate = candidate.filter(e => name.test((typeof e.name === 'string' ? e.name : e.name.string)));
      }

      if (fullname) {
        candidate = candidate.filter(e => e.getQualifiedName() === fullname);
      }

      if (typeof inFile === 'object') {
        // @ts-ignore
        candidate = candidate.filter(e => haveLocation(e) && e.sourceFile === inFile);
      } else if (typeof inFile === 'string') {
        // This expects the file name without any directories as input
        // @ts-ignore
        candidate = candidate.filter(e => haveLocation(e) && e.sourceFile.name.codeName === inFile);
      }

      if (startLine) {
        // @ts-ignore
        candidate = candidate.filter(e => haveLocation(e) && e.location.start.line === startLine);
      }

      if (startColumn) {
        // @ts-ignore
        candidate = candidate.filter(e => haveLocation(e) && e.location.start.column === startColumn);
      }

      if (endLine) {
        candidate = candidate.filter(e => haveLocation(e) && expandENRELocation(e).end.line === endLine);
      }

      if (endColumn) {
        candidate = candidate.filter(e => haveLocation(e) && expandENRELocation(e).end.column === endColumn);
      }

      for (const [k, v] of Object.entries(any)) {
        // @ts-ignore
        candidate = candidate.filter(e => k in e && e[k] === v);
      }

      return candidate;
    },


    reset: () => {
      _e = [];
    }
  };
};

/**
 * By invoking immediately, anywhere else in a single run
 * will gain access to this single global instance.
 */
export default createEntityContainer();
