import {allPossibleEntityTypes} from './entities';

// SHOULD ONLY BE INVOKED ONCE (That is, the very first initialization)
const createEntityList = () => {
  let eList: Array<allPossibleEntityTypes> = [];

  return {
    add: (entity: allPossibleEntityTypes) => {
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

export default createEntityList();
