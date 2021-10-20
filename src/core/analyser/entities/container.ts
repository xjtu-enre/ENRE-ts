import {ENREEntityAll} from './index';

// SHOULD ONLY BE INVOKED ONCE (That is, the very first initialization)
const createEntityContainer = () => {
  let eList: Array<ENREEntityAll> = [];

  return {
    add: (entity: ENREEntityAll) => {
      eList.push(entity);
    },

    get all() {
      return eList;
    },

    getById: (id: number) => {
      return eList.find(e => e.id === id);
    }
  };
};

export default createEntityContainer();
