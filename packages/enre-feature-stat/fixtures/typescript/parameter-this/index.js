export default {
  dependencies: ['all-functions', 'all-classes', 'function-with-parameter-this'],
  process: (funcs, clzs, feated) => {
    const
      allFuncs = funcs.filter(f => ['FunctionDeclaration', 'FUnctionExpression', 'MethodDeclaration'].includes(f.functionNodeType)).length,
      featedCount = feated.length,
      indices = feated.map(f => f.thisIndex).reduce((p, c) => {
        if (p[c] === undefined) p[c] = 0;
        p[c] += 1;
        return p;
      }, {}),
      parentIsFunction = feated.filter(f => ['FunctionDeclaration', 'FunctionExpression'].includes(f.functionNodeType)).length,
      parentIsMethod = feated.filter(f => f.functionNodeType === 'MethodDeclaration').length;

    let typedAsContainingClass = 0;
    for (const func of feated) {
      if (func.functionNodeType === 'MethodDeclaration') {
        const clz = clzs.classWithName.find(c => c.oid === func.containingClassOid);
        if (clz && clz.className === func.thisTypeText) {
          typedAsContainingClass += 1;
        }
      }
    }


    return {
      'all-functions': allFuncs,
      'function-with-parameter-this': featedCount,
      'feature-usage-against-applicable-function': featedCount / allFuncs,

      'types-parent': {
        'ParentIsFunction': parentIsFunction,
        'ParentIsMethod': parentIsMethod,
      },

      'types-type': {
        'typedAsContainingClass': typedAsContainingClass,
        'typedNotAsContainingClass': parentIsMethod - typedAsContainingClass,
      },

      'indices': indices,
    };
  }
};
