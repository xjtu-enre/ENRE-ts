import {toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-variable-declarations'],
  process: (res) => {
    let
      emptyArrayPattern = 0,
      emptyObjPattern = 0;

    for (const decl of res.variableDeclaration) {
      if (decl.nameNodeChildrenCount === 0) {
        if (decl.nameNodeType === 'ObjectBindingPattern') {
          emptyObjPattern += 1;
        } else if (decl.nameNodeType === 'ArrayBindingPattern') {
          emptyArrayPattern += 1;
        }
      }
    }

    const
      allDeclCount = res.variableDeclaration.length,
      featureUsage = emptyArrayPattern + emptyObjPattern;

    return {
      'all-variable-declarations': allDeclCount,
      'empty-object-pattern': emptyObjPattern,
      'empty-array-pattern': emptyArrayPattern,
      'feature-usage-against-variable-declaration': toFixed(featureUsage / allDeclCount),
    };
  }
};
