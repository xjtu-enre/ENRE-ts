import {toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-type-parameters'],
  process: (res) => {
    const
      allTPs = res.allTypeParameters.length,
      constTPs = res.constTypeParameter.length;

    return {
      'all-type-parameters': allTPs,
      'const-type-parameters': constTPs,
      'feature-usage-against-type-parameter': toFixed(constTPs / allTPs),
    };
  }
};
