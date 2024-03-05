import {toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-enum-members'],
  process: (res) => {
    const
      allEnumMembers = res.length,
      enumMemberWithFancyName = res
        .filter(r => r.enumMemberNameType !== 'Identifier')
        .map(r => r.enumMemberNameType)
        .reduce((p, c) => {
          if (!(c in p)) {
            p[c] = 0;
          }

          p[c] += 1;
          return p;
        }, {}),
      enumMemberWithFancyNameCount = Object.values(enumMemberWithFancyName).reduce((p, c) => p + c, 0);

    return {
      'all-enum-members': allEnumMembers,
      'enum-member-with-fancy-name': enumMemberWithFancyNameCount,
      'feature-usage-against-enum-member': toFixed(enumMemberWithFancyNameCount / allEnumMembers),

      'types': enumMemberWithFancyName,
    };
  }
};
