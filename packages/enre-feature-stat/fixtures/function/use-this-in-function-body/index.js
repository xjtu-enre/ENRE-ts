import {groupCountBy} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-functions', 'function-using-this'],
  process: (func, funcFeated, isTraceMode) => {
    const
      // Only take function declaration/expression into consideration
      funcCount = func.filter(f => ['FunctionDeclaration', 'FunctionExpression'].includes(f.functionNodeType)).length,
      funcFeatedCount = funcFeated.functionUsingThis.length,
      newCall = new Set(),
      normalCall = new Set(),
      thisContext = groupCountBy(funcFeated.thisContext, 'parentNodeType');

    for (const callsite of funcFeated.functionCallsite) {
      if (callsite.isNewExpression) {
        newCall.add(callsite.functionOid);
      } else {
        normalCall.add(callsite.functionOid);
      }
    }

    function traceUtil(source) {
      return source
        .map(oid => funcFeated.functionUsingThis.find(f => f.functionOid === oid))
        .filter(f => f)
        .map(f => [f, funcFeated.functionCallsite.find(c => c.filePath === f.filePath && c.functionOid === f.functionOid)])
        .filter(x => x[1])
        .map(x => `${x[0].filePath}#L${x[0].functionStartLine}-L${x[1].callsiteStartLine}`);
    }

    return {
      'all-functions': funcCount,
      'function-assign-to-this': funcFeatedCount,
      'feature-usage-against-function': funcFeatedCount / funcCount,
      'types': {
        'called-with-new': newCall.size,
        'called-without-new': normalCall.size,
      },

      'this-context': thisContext,

      'trace|types/called-with-new': isTraceMode ?
        traceUtil([...newCall])
        : undefined,
      'trace|types/called-without-new': isTraceMode ?
        traceUtil([...normalCall])
        : undefined,
    };
  },
};
