const createPostponedTaskContainer = () => {
  let pt: any[] = [];

  return {
    add: (task: any) => {
      pt.push(task);
    },

    get all() {
      return pt;
    },

    reset: () => {
      pt = [];
    }
  };
};

export default createPostponedTaskContainer();
