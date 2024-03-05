import {toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-enum-members'],
  process: (res) => {
    const
      allEnumMembers = res.length,
      enumMemberWithInitializer = res
        .filter(r => r.enumMemberInitializerType !== '-')
        .map(r => r.enumMemberInitializerType)
        .reduce((p, c) => {
          if (!(c in p)) {
            p[c] = 0;
          }

          p[c] += 1;
          return p;
        }, {}),
      enumMemberWithInitializerCount = Object.values(enumMemberWithInitializer).reduce((p, c) => p + c, 0);

    return {
      'all-enum-members': allEnumMembers,
      'enum-member-with-initializer': enumMemberWithInitializerCount,
      'feature-usage-against-enum-member': toFixed(enumMemberWithInitializerCount / allEnumMembers),

      'types': enumMemberWithInitializer,
    };
  }
};
