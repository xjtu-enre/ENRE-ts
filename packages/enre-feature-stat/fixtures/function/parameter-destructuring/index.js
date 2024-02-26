import {toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-functions', 'function-with-dest-param'],
  process: (func, funcFeated) => {
    const
      funcCount = func.length,
      funcWithDPCount = funcFeated.length;

    return {
      'function/parameter-destructuring': {
        'all-functions': funcCount,
        'function-with-dest-param': funcWithDPCount,
        'feature-usage-against-function': toFixed(funcWithDPCount / funcCount),
      }
    };
  },
};
