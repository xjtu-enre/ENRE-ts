import {toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-variable-declarations'],
  process: (res) => {
    let varCount = 0;

    for (const stmt of res.variableStatement) {
      if (stmt.nodeText.startsWith('var ')) {
        varCount += 1;
      }
    }

    const allStmts = res.variableStatement.length;

    return {
      'all-variable-declaration-statements': allStmts,
      'keyword-var-used': varCount,
      'feature-usage-against-variable-declaration-statement': toFixed(varCount / allStmts),
    };
  }
};
