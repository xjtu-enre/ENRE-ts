export default {
  dependencies: ['type-only-import-and-export', 'all-import-declarations', 'all-export-declarations'],
  process: (feated, imports, exports) => {
    const
      typeableElements =
        imports.importDeclaration.length
        + imports.importSpecifier.length
        + exports.namedExport.length
        + exports.reexport.length
        + exports.exportSpecifier.length,
      featedCount = Object.values(feated).reduce((p, c) => p + c.length, 0);

    return {
      'all-typeable-import-export-elements': typeableElements,
      'type-only-import-export-elements': featedCount,
      'feature-usage-against-all-typeable-element': featedCount / typeableElements,
    };
  }
};
