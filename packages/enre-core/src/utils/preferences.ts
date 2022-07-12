import {setVerbose} from '@enre/logging';

const preferences = new Map();

// Default preference values

preferences.set('performance.multi-thread-enabled', true);
preferences.set('performance.number-of-processors', 1);

preferences.set('logging.verbose', false);

preferences.set('info.base-path', '');


const hookedSet = (key: any, value: any) => {
  if (key === 'logging.verbose') {
    setVerbose(value);
  }

  preferences.set(key, value);
};

export default {
  set: hookedSet.bind(preferences),
  get: preferences.get.bind(preferences),
};
