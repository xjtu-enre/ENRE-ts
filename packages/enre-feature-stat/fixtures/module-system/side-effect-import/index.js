import {toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-export-declarations', 'all-import-declarations'],
  process: (es, is) => {
    const
      allCount = es.reexport.filter(e => e.isNamedExports).length + is.importDeclaration.length,
      noBrace = is.importDeclaration.filter(i => i.isSideEffectImport).length,
      importClauseWithNamedImports = is.importClause.filter(i => i.namedBindingsType === 'NamedImports').map(i => i.clauseOid).reduce((p, c) => {
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
      'feature-usage-against-import-declaration': toFixed(featedCount / allCount),

      'types': {
        'EmptyBraceImport': emptyBraceImport,
        'EmptyBraceReexport': emptyBraceReexport,
        'NoBrace': noBrace,
      }
    };
  }
};
