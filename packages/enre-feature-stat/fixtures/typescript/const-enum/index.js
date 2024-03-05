import {toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-enums'],
  process: (res) => {
    const
      allEnums = res.allEnums.length,
      constEnums = res.constEnum.length;

    return {
      'all-enums': allEnums,
      'const-enums': constEnums,
      'feature-usage-against-enum-declaration': toFixed(constEnums / allEnums),
    };
  }
};
