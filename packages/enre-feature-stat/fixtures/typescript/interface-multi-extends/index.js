import {pmax, toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['interface-with-extends'],
  process: (res) => {
    const
      allInterfaceWithExtends = res.filter(c => c.typeCount > 0).length,
      featedInterface = res.filter(c => c.typeCount > 1).length,
      maxCount = pmax(res.map(c => c.typeCount));

    return {
      'all-interface-with-extends': allInterfaceWithExtends,
      'interface-with-multiple-extends': featedInterface,
      'feature-usage-against-interface-with-extends': toFixed(featedInterface / allInterfaceWithExtends),

      'max-count-of-extends-in-one-interface': maxCount,
    };
  }
};
