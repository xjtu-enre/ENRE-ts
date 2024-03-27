import {pmax, resolveNestingRelation} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-standalone-blocks', 'standalone-block-nesting-relation'],
  process: (blocks, nr) => {
    let
      declarationInside = 0,
      noDeclaration = 0,
      multipleInSwitchCaseClause = 0,
      singleInSwitchCaseClause = 0,
      noneInSwitchCaseClause = 0;

    for (const block of blocks.generalStandaloneBlock) {
      if (block.hasDeclaration) {
        declarationInside += 1;
      } else {
        noDeclaration += 1;
      }
    }

    for (const block of blocks.switchCaseClauseStandaloneBlock) {
      if (block.blockCount > 1) {
        multipleInSwitchCaseClause += 1;
      } else if (block.blockCount === 1) {
        singleInSwitchCaseClause += 1;
      } else {
        noneInSwitchCaseClause += 1;
      }
    }

    const [, relLengths] = resolveNestingRelation(nr, 'blockOid', 'parentBlockOid');

    const
      allCount = blocks.generalStandaloneBlock.length,
      switchCaseClauseCount = blocks.switchCaseClauseStandaloneBlock.length;

    return {
      'all-standalone-blocks': allCount,

      'types-decl': {
        'declaration-inside': declarationInside,
        'no-declaration': noDeclaration,
      },

      'types-case': {
        'multiple-in-switch-case-clause': multipleInSwitchCaseClause,
        'single-in-switch-case-clause': singleInSwitchCaseClause,
        'none-in-switch-case-clause': noneInSwitchCaseClause,
      },

      'feature-usage-in-switch-case-clause': (multipleInSwitchCaseClause + singleInSwitchCaseClause) / switchCaseClauseCount,

      'max-count-of-nesting-depth': pmax(relLengths),

      'max-count-of-in-switch-case-clause': pmax(blocks.switchCaseClauseStandaloneBlock.map(b => b.blockCount)),
    };
  },
};
