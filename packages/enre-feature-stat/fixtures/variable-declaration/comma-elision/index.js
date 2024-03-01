import {toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-variable-declarations', 'comma-elision-decl'],
  process: (vars, decls) => {
    const
      allArrayDest = vars.variableDeclaration.filter(v => v.nameNodeType === 'ArrayBindingPattern').length,
      arrayDestWithCommaElision = decls.arrayBindingPattern.filter(p => p.elisionCount > 0).length,
      arrayDestWithPseudoElision = decls.arrayBindingPatternWithPseudoElision.length,
      featureCount = arrayDestWithCommaElision + arrayDestWithPseudoElision;

    return {
      'all-array-destructuring-variable-declarations': allArrayDest,
      'array-destructuring-with-elision': featureCount,
      'feature-usage-against-variable-array-destructuring-usage': toFixed(featureCount / allArrayDest),

      'types': {
        'comma-elision': arrayDestWithCommaElision,
        'pseudo-elision': arrayDestWithPseudoElision,
      }
    };
  }
};
