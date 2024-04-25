import {pmax, resolveNestingRelation} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-standalone-blocks', 'standalone-block-nesting-relation'],
  process: (blocks, nr, isTraceMode) => {
    let
      declarationInside = 0,
      noDeclaration = 0,
      multipleInSwitchCaseClause = 0,
      singleInSwitchCaseClause = 0,
      noneInSwitchCaseClause = 0,
      oidMap = new Map(),
      declarationInsideCaseBlockSource = [],
      declarationInsideNonCaseBlockSource = [],
      noDeclarationCaseBlockSource = [],
      noDeclarationNonCaseBlockSource = [];


    for (const block of blocks.generalStandaloneBlock) {
      oidMap.set(block.blockOid, `${block.filePath}#L${block.blockStartLine}`);

      if (block.hasDeclaration) {
        declarationInside += 1;
        if (['CaseClause', 'DefaultClause'].includes(block.parentNodeType)) {
          declarationInsideCaseBlockSource.push(`${block.filePath}#L${block.blockStartLine}`);
        } else {
          declarationInsideNonCaseBlockSource.push(`${block.filePath}#L${block.blockStartLine}`);
        }
      } else {
        noDeclaration += 1;
        if (['CaseClause', 'DefaultClause'].includes(block.parentNodeType)) {
          noDeclarationCaseBlockSource.push(`${block.filePath}#L${block.blockStartLine}`);
        } else {
          noDeclarationNonCaseBlockSource.push(`${block.filePath}#L${block.blockStartLine}`);
        }
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

    const topOids = [];

    const [, relLengths] = resolveNestingRelation(nr, 'blockOid', 'parentBlockOid', {
      onTop: oid => (topOids.push(oid), true),
    });

    const
      allCount = blocks.generalStandaloneBlock.length,
      switchCaseClauseCount = blocks.switchCaseClauseStandaloneBlock.length,
      maxNestingDepth = pmax(relLengths);

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

      'max-count-of-nesting-depth': maxNestingDepth,

      'max-count-of-in-switch-case-clause': pmax(blocks.switchCaseClauseStandaloneBlock.map(b => b.blockCount)),

      'trace|types-decl/declaration-inside/case': isTraceMode ? declarationInsideCaseBlockSource : undefined,
      'trace|types-decl/declaration-inside/non-case': isTraceMode ? declarationInsideNonCaseBlockSource : undefined,
      'trace|types-decl/no-declaration/case': isTraceMode ? noDeclarationCaseBlockSource : undefined,
      'trace|types-decl/no-declaration/non-case': isTraceMode ? noDeclarationNonCaseBlockSource : undefined,

      'trace|max-count-of-nesting-depth': isTraceMode ? oidMap.get(topOids[relLengths.findIndex(v => v === maxNestingDepth)]) : undefined,
    };
  },
};
