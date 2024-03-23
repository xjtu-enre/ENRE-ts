import {groupCountBy} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-enum-members', 'all-enums'],
  process: (res, enums, isTraceMode) => {
    const
      allEnumMembers = res.length,
      enumNumericInitMap = {},
      enumMemberWithInitializer = groupCountBy(
        res.filter(r => r.enumMemberInitializerType !== '-'),
        'enumMemberInitializerType',
      ),
      enumMemberWithInitializerCount = Object.values(enumMemberWithInitializer).reduce((p, c) => p + c, 0);

    res.forEach(r => {
      if (!(r.enumOid in enumNumericInitMap)) {
        enumNumericInitMap[r.enumOid] = {
          'initedIndex': [],
          'uninitedIndex': [],
        };
      }

      if (r.enumMemberInitializerType === 'NumericLiteral') {
        if (r.enumMemberInitializerType === '-') {
          enumNumericInitMap[r.enumOid].uninitedIndex.push(r.enumMemberIndex);
        } else {
          enumNumericInitMap[r.enumOid].initedIndex.push(r.enumMemberIndex);
        }
      }
    });

    const
      atLeastInitMap = Object.entries(enumNumericInitMap)
        .filter(([, x]) => x.initedIndex.length !== 0),
      /**
       * Full init contains two cases:
       *
       * 1. All members are initialized;
       *
       * 2. Only the first (index=0) member is initialized.
       *
       * (That is, no initializer in the middle)
       */
      fullInit =
        atLeastInitMap.filter(([, x]) => x.uninitedIndex.length === 0 || (x.initedIndex.length === 1 && x.initedIndex[0] === 0)),
      fullInitCount = fullInit.length,
      partialInitCount = atLeastInitMap.length - fullInitCount;

    return {
      'all-enum-members': allEnumMembers,
      'enum-member-with-initializer': enumMemberWithInitializerCount,
      'feature-usage-against-enum-member': enumMemberWithInitializerCount / allEnumMembers,

      'types-initializer-node': enumMemberWithInitializer,

      'types-initializer-index': {
        'PartialInit': partialInitCount,
        'FullInit': fullInitCount,
      },

      'trace|types-initializer-index/PartialInit': isTraceMode ?
        atLeastInitMap.filter(x => !fullInit.includes(x))
          .map(oid => enums.allEnums.find(e => e.enumOid === oid))
          .filter(e => e)
          .map(e => `${e.filePath}#L${e.enumStartLine}`)
        : undefined,
    };
  }
};
