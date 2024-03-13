import {pmax} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-variable-declarations'],
  process: (res, isTraceMode) => {
    const id2CountMap = {}, traceId2File = {};

    for (const decl of res.variableDeclaration) {
      if (!(decl.parentOid in id2CountMap)) {
        id2CountMap[decl.parentOid] = 0;
      }

      id2CountMap[decl.parentOid] += 1;

      if (isTraceMode) {
        if (!(decl.parentOid in traceId2File)) {
          traceId2File[decl.parentOid] = decl.filePath + ':' + decl.nodeStartLine;
        }
      }
    }

    const allCount = res.variableStatement.length,
      featureCount = Object.values(id2CountMap).filter(count => count > 1).length;

    return {
      'all-variable-declaration-statements': allCount,
      'decl-list-have-more-than-one-element': featureCount,
      'feature-usage-against-variable-declaration-statement': featureCount / allCount,

      'max-count-of-list-length': pmax(Object.values(id2CountMap)),
      'trace|max-count-of-list-length': isTraceMode ? traceId2File[pmax(Object.entries(id2CountMap), 1)[0]] : undefined,
    };
  }
};
