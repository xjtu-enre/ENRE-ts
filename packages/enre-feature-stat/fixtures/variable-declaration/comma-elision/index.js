import {pmax} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-variable-declarations', 'comma-elision-decl'],
  process: (vars, decls, isTraceMode) => {
    const
      declIds = vars.variableDeclaration.map(record => record.nodeOid),
      allArrayDest = vars.variableDeclaration.filter(v => v.nameNodeType === 'ArrayBindingPattern').length,
      arrayDestWithCommaElision = decls.arrayBindingPattern.filter(p => declIds.includes(p.varNodeOid) && p.elisionCount > 0).length,
      arrayDestWithPseudoElision = decls.arrayBindingPatternWithPseudoElision.filter(p => declIds.includes(p.varNodeOid)).length,
      maxElisionUsage = pmax(decls.arrayBindingPattern.filter(p => declIds.includes(p.varNodeOid)), 'elisionCount'),
      featureCount = arrayDestWithCommaElision + arrayDestWithPseudoElision,
      traceFile = vars.variableDeclaration.find(v => v.nodeOid === maxElisionUsage);

    return {
      'all-array-destructuring-variable-declarations': allArrayDest,
      'array-destructuring-with-elision': featureCount,
      'feature-usage-against-variable-array-destructuring-usage': featureCount / allArrayDest,

      'max-count-of-comma-elisions-in-one-declaration': maxElisionUsage.elisionCount || 0,

      'types': {
        'comma-elision': arrayDestWithCommaElision,
        'pseudo-elision': arrayDestWithPseudoElision,
      },

      'trace|max-count-of-comma-elisions-in-one-declaration': (isTraceMode && traceFile) ? `${traceFile.filePath}#L${traceFile.nodeStartLine}` : undefined,
    };
  }
};
