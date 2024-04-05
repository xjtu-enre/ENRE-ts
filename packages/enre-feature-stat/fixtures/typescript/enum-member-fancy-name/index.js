import {groupCountBy} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-enum-members'],
  process: (res, isTraceMode) => {
    const
      allEnumMembers = res.length,
      enumMemberWithStringLiteral = groupCountBy(res.filter(r => r.enumMemberNameType !== 'Identifier'), 'enumMemberNameType'),
      enumMemberWithStringLiteralCount = Object.values(enumMemberWithStringLiteral).reduce((p, c) => p + c, 0),
      enumMemberWithConfusingName = res.filter(r => r.enumMemberNameType === 'StringLiteral' && !/^[a-zA-Z][a-zA-Z0-9_]+/.test(r.enumMemberName)),
      enumMemberWithConfusingNameCount = enumMemberWithConfusingName.length;

    return {
      'all-enum-members': allEnumMembers,
      'enum-member-with-non-identifier': enumMemberWithStringLiteralCount,
      'feature-usage-string-literal-against-enum-member': enumMemberWithStringLiteralCount / allEnumMembers,
      'feature-usage-confusing-name-against-string-literal-name': enumMemberWithConfusingNameCount / enumMemberWithStringLiteralCount,

      'trace|feature-usage-confusing-name-against-string-literal-name': isTraceMode ? enumMemberWithConfusingName.map(r => `${r.filePath}#L${r.enumMemberStartLine}`) : undefined,
    };
  }
};
