export default {
  dependencies: ['all-export-declarations', 'all-import-declarations'],
  process: (es, is, isTraceMode) => {
    const
      allCount = es.reexport.filter(e => e.isNamedExports).length + is.importDeclaration.length,
      noBrace = is.importDeclaration.filter(i => i.isSideEffectImport).length,
      importClauseWithNamedImports = is.importClause
        .filter(i => i.namedBindingsType === 'NamedImports')
        .map(i => i.clauseOid)
        .reduce((p, c) => {
          p[c] = 0;
          return p;
        }, {}),
      emptyBraceReexport = es.reexport.filter(r => r.namedExportsElementCount === 0).length;

    is.importSpecifier.forEach(i => importClauseWithNamedImports[i.clauseOid] += 1);

    const
      emptyBraceImport = Object.values(importClauseWithNamedImports).filter(v => v === 0).length,
      featedCount = noBrace + emptyBraceImport + emptyBraceReexport;

    return {
      'all-import-declarations': allCount,
      'side-effect-import': featedCount,
      'feature-usage-against-import-declaration': featedCount / allCount,

      'types': {
        'EmptyBraceImport': emptyBraceImport,
        'EmptyBraceReexport': emptyBraceReexport,
        'NoBrace': noBrace,
      },

      'trace|types/EmptyBraceImport': isTraceMode ?
        Object.entries(importClauseWithNamedImports).filter(([, v]) => v === 0)
          .map((([cOid]) => is.importClause.find(ic => ic.clauseOid.toString() === cOid)?.declOid))
          .filter(declOid => declOid !== undefined)
          .map(declOid => is.importDeclaration.find(id => id.declarationOid === declOid))
          .filter(id => id !== undefined)
          .map(id => `${id.filePath}#L${id.declarationStartLine}`)
        : undefined,
    };
  }
};
