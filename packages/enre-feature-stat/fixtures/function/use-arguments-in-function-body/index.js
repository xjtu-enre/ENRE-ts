import {groupCountBy, toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-functions', 'function-using-arguments'],
  process: (func, funcFeated) => {
    let
      funcFeatedWithNormalParamDecl = 0,
      funcFeatedWithRestParamDecl = 0,
      funcFeatedWithoutParamDecl = 0;

    for (const fc of funcFeated) {
      if (fc.paramCount === 0) {
        funcFeatedWithoutParamDecl += 1;
      } else {
        if (fc.isLastParamRestParam) {
          funcFeatedWithRestParamDecl += 1;
        } else {
          funcFeatedWithNormalParamDecl += 1;
        }
      }
    }

    const
      funcCount = func.length,
      funcFeatedCount = funcFeated.length,
      argumentsContext = groupCountBy(funcFeated.argumentsContext, 'parentNodeType');

    return {
      'all-functions': funcCount,
      'function-using-arguments': funcFeatedCount,
      'feature-usage-against-function': toFixed(funcFeatedCount / funcCount),
      'types': {
        'with-normal-param-decl': funcFeatedWithNormalParamDecl,
        'with-rest-param-decl': funcFeatedWithRestParamDecl,
        'without-param-decl': funcFeatedWithoutParamDecl,
      },

      'arguments-context': argumentsContext,
    };
  }
};
