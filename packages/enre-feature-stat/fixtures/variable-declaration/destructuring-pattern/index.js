import {pmax, resolveNestingRelation, toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-variable-declarations', 'binding-pattern-nesting-relation', 'rest-variable-decl'],
  process: (vars, rels, rests) => {
    let
      patternCount = 0,
      containedByForStmt = 0;

    for (const decl of vars.variableDeclaration) {
      if (['ArrayBindingPattern', 'ObjectBindingPattern'].includes(decl.nameNodeType)) {
        patternCount += 1;

        if (['ForInStatement', 'ForOfStatement'].includes(decl.containingNodeType)) {
          containedByForStmt += 1;
        }
      }
    }

    const varDeclNameNodeIDs = vars.variableDeclaration.map(v => v.nameNodeOid);
    const restNameIsPtnIDs = rests.filter(r => r.restNodeType !== 'Identifier').map(r => r.nameNodeOid);

    const [, relLengths] = resolveNestingRelation(
      rels,
      'nodeOid',
      'parentNodeOid',
      {
        onTop: (oid) => varDeclNameNodeIDs.includes(oid) || !restNameIsPtnIDs.includes(oid)
      }
    );

    const
      allCount = vars.variableDeclaration.length;

    return {
      'all-variable-declaration-count': allCount,
      'destructuring-pattern-count': patternCount,
      'feature-usage-against-variable-declaration': toFixed(patternCount / allCount),

      'max-count-of-nesting-depth': pmax(...relLengths),

      'types': {
        'in-for-statement': containedByForStmt,
        'not-in-for-statement': patternCount - containedByForStmt,
      }
    };
  }
};
