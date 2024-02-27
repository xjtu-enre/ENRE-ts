import {toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-standalone-blocks'],
  process: (blocks) => {
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

    // Use linked list to form the nesting relation from p2p relations
    // A parent can have multiple children, but a child can only have one parent
    const
      nodes = new Map(),
      relLengths = [];

    for (const rel of blocks.standaloneBlockNestingRelation) {
      for (const oid of [rel.blockOid, rel.parentBlockOid]) {
        if (!nodes.has(oid)) {
          nodes.set(oid, {prev: undefined, next: []});
        }
      }

      // Link two vertexes to an edge
      nodes.get(rel.parentBlockOid).next.push(nodes.get(rel.blockOid));

      if (nodes.get(rel.blockOid).prev) {
        throw new Error('Linked list is going to branch, which should not happen');
      } else {
        nodes.get(rel.blockOid).prev = nodes.get(rel.parentBlockOid);
      }
    }

    /**
     * Count the longest relation's length from the tail node (so that avoid branching)
     */
    for (const node of nodes.values()) {
      if (node.next.length === 0) {
        let length = 1;
        for (let p = node.prev; p; p = p.prev) {
          length += 1;
        }
        relLengths.push(length);
      }
    }

    const
      allCount = blocks.generalStandaloneBlock.length,
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
