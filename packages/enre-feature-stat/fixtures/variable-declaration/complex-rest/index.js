import {pmax, resolveNestingRelation, toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['binding-pattern-nesting-relation', 'rest-variable-decl'],
  process: (rels, rests) => {
    let
      destedRestCount = 0;

    for (const rest of rests) {
      if (rest.restNodeType === 'ArrayBindingPattern') {
        destedRestCount += 1;
      }
    }

    const restNameIsPtnIDs = rests.filter(r => r.restNodeType !== 'Identifier').map(r => r.nameNodeOid);

    const [, relLengths] = resolveNestingRelation(
      rels,
      'nodeOid',
      'parentNodeOid',
      {
        onTop: (oid) => restNameIsPtnIDs.includes(oid)
      }
    );

    const
      allCount = rests.length,
      maxCount = pmax(relLengths);

    return {
      'all-array-rest-variable-declarations': allCount,
      'destructured-rest-variable': destedRestCount,
      'feature-usage-against-variable-array-destructuring-rest-operator': toFixed(destedRestCount / allCount),

      // Nesting depth starts from rest variable (but not the containing array destructuring pattern)
      'max-count-of-nesting-depth': maxCount > 1 ? maxCount - 1 : maxCount,
    };
  }
};
