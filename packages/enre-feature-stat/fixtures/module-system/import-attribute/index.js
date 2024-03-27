export default {
  dependencies: ['all-export-declarations', 'all-import-declarations', 'import-function-callsite'],
  process: (es, is, funcCall) => {
    const
      allAssertableCount =
        es.reexport.length
        + is.importDeclaration.length
        + funcCall.all.length,
      featedCount =
        es.reexport.filter(r => r.hasAssert).length
        + is.importDeclaration.filter(i => i.hasAssert).length
        + funcCall.all.filter(f => f.hasAssert).length;

    return {
      'all-assertable-declarations': allAssertableCount,
      'asserted-declaration': featedCount,
      'feature-usage-against-assertable-declaration': featedCount / allAssertableCount,
    };
  }
};
