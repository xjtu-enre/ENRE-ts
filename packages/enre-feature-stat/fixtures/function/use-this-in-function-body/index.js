import {toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-functions', 'function-assign-to-this'],
  process: (func, funcFeated) => {
    const
      // Only take function declaration/expression into consideration
      funcCount = func.filter(f => ['FunctionDeclaration', 'FunctionExpression'].includes(f.functionNodeType)).length,
      funcFeatedCount = funcFeated.functionAssigningToThis.length,
      newCall = new Set(),
      normalCall = new Set();

    for (const callsite of funcFeated.callsite) {
      if (callsite.isNewExpression) {
        newCall.add(callsite.functionOid);
      } else {
        normalCall.add(callsite.functionOid);
      }
    }

    return {
      'all-functions': funcCount,
      'function-assign-to-this': funcFeatedCount,
      'feature-usage-against-function': toFixed(funcFeatedCount / funcCount),
      'types': {
        'called-with-new': newCall.size,
        'called-without-new': normalCall.size,
      }
    };
  },
};
