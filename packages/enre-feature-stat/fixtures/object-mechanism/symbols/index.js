import {groupCountBy} from '../../_utils/post-process.js';

export default {
  dependencies: ['symbol-usages'],
  process: (res) => {
    const
      grouped = groupCountBy(res, 'symbolName');

    return {
      'all-symbol-usages': res.length,

      'types': grouped,
    };
  }
};
