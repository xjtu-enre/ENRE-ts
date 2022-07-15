import env from '@enre/environment';
import {panic} from '@enre/logging';
import {ENREEntityCollectionAll} from '../entity/collections';

// SHOULD ONLY BE INVOKED ONCE (That is, the very first initialization)
const createEntityContainer = () => {
  let eContainer: Array<ENREEntityCollectionAll> = [];

  return {
    add: (entity: ENREEntityCollectionAll) => {
      eContainer.push(entity);
    },

    get all() {
      return eContainer;
    },

    get nextId() {
      return eContainer.length;
    },

    getById: (id: number) => {
      return eContainer.find(e => e.id === id);
    },

    reset: () => {
      if (!env.test) {
        panic('Function reset can only run under the TEST environment');
      }

      eContainer = [];
    }
  };
};

export default createEntityContainer();
