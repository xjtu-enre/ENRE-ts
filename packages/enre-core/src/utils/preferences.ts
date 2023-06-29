const preferences = new Map();

// Default preference values
preferences.set('logging.verbose', false);

preferences.set('info.base-path', '');


export default {
  set: preferences.set.bind(preferences),
  get: preferences.get.bind(preferences),
};
