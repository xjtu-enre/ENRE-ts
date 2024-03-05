import {pmax, toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['class-with-implement'],
  process: (res) => {
    const
      allClassWithImpl = res.filter(c => c.typeCount > 0).length,
      featedClass = res.filter(c => c.typeCount > 1).length,
      maxCount = pmax(res.map(c => c.typeCount));

    return {
      'all-class-with-implement': allClassWithImpl,
      'class-with-multiple-implements': featedClass,
      'feature-usage-against-class-with-implement': toFixed(featedClass / allClassWithImpl),

      'max-count-of-implements-in-one-class': maxCount,
    };
  }
};
