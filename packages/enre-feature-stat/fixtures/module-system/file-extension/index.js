import {groupCountBy} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-files'],
  process: (res) => {
    const
      allCount = res.length,
      newExtCount = res.filter(f => ['.mjs', '.cjs', '.mts', '.cts'].includes(f.extName)).length,
      group = groupCountBy(res, 'extName');

    return {
      'all-files': allCount,
      'file-with-new-ext-name': newExtCount,
      'feature-usage-against-file': newExtCount / allCount,

      'types': group,
    };
  }
};
