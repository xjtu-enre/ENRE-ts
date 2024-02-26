import {toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-standalone-blocks'],
  process: (blocks) => {
    let
      allCount = 0,
      declarationInside = 0,
      noDeclaration = 0,
      multipleInSwitchCaseClause = 0,
      singleInSwitchCaseClause = 0,
      noneInSwitchCaseClause = 0,
      // To address duplication issue (see godel script's FIXME)
      uniqueHelper = new Set();

    for (const block of blocks.generalStandaloneBlock) {
      const key = `${block.filePath}:${block.blockStartLine}:${block.blockStartColumn}:${block.blockEndLine}:${block.blockEndColumn}`;
      if (uniqueHelper.has(key)) {
        continue;
      } else {
        uniqueHelper.add(key);
      }

      allCount += 1;

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

    // Use linked list to form the nesting relation from p2p relations
    const
      nodes = new Map(),
      relLengths = [];

    for (const rel of blocks.standaloneBlockNestingRelation) {
      for (const oid of [rel.blockOid, rel.parentBlockOid]) {
        if (!nodes.has(oid)) {
          nodes.set(oid, {prev: undefined, next: undefined});
        }
      }

      // Link two vertexes to an edge
      if (nodes.get(rel.blockOid).next) {
        throw new Error('Linked list is going to branch, which should not happen');
      } else {
        nodes.get(rel.blockOid).next = nodes.get(rel.parentBlockOid);

        if (nodes.get(rel.parentBlockOid).prev) {
          throw new Error('Linked list is going to branch, which should not happen');
        } else {
          nodes.get(rel.parentBlockOid).prev = nodes.get(rel.blockOid);
        }
      }
    }

    /**
     * Enumerate all nodes whose prev is undefined (the link head), and count the length
     * of the linked list until next is undefined (the link tail).
     */
    for (const node of nodes.values()) {
      if (!node.prev) {
        let length = 0;
        for (let n = node; n; n = n.next) {
          length += 1;
        }
        relLengths.push(length);
      }
    }

    const
      switchCaseClauseCount = blocks.switchCaseClauseStandaloneBlock.length;

    return {
      'misc/standalone-blocks': {
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

        'feature-usage-in-switch-case-clause': toFixed((multipleInSwitchCaseClause + singleInSwitchCaseClause) / switchCaseClauseCount),

        'max-count-of-nesting-depth': Math.max(...relLengths),

        'max-count-of-in-switch-case-clause': Math.max(...blocks.switchCaseClauseStandaloneBlock.map(b => b.blockCount)),
      }
    };
  },
};
