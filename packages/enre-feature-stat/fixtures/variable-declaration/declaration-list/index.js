import {pmax, toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-variable-declarations'],
  process: (res) => {
    const id2CountMap = {};

    for (const decl of res.variableDeclaration) {
      if (!(decl.parentOid in id2CountMap)) {
        id2CountMap[decl.parentOid] = 0;
      }

      id2CountMap[decl.parentOid] += 1;
    }

    const allCount = res.variableStatement.length,
      featureCount = Object.values(id2CountMap).filter(count => count > 1).length;

    return {
      'all-variable-declaration-statements': allCount,
      'decl-list-have-more-than-one-element': featureCount,
      'feature-usage-against-variable-declaration-statement': toFixed(featureCount / allCount),

      'max-count-of-list-length': pmax(...Object.values(id2CountMap)),
    };
  }
};
