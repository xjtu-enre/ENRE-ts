import {ENREEntityAll} from './index';
import env from '../../utils/env';
import {errorAndExit} from '../../utils/cliRender';

// SHOULD ONLY BE INVOKED ONCE (That is, the very first initialization)
const createEntityContainer = () => {
  let eContainer: Array<ENREEntityAll> = [];

  return {
    add: (entity: ENREEntityAll) => {
      eContainer.push(entity);
    },

    get all() {
      return eContainer;
    },

    getById: (id: number) => {
      return eContainer.find(e => e.id === id);
    },

    reset: () => {
      if (!env.test) {
        errorAndExit('Function reset can only run under the TEST environment');
      }

      eContainer = [];
    }
  };
};

export const eContainer = createEntityContainer();
