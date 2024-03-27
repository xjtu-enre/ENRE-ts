export default {
  dependencies: ['cjs-file', 'all-export-declarations', 'all-import-declarations', 'import-function-callsite'],
  process: (cjs, es, is, func) => {
    const
      esmFiles = new Set(),
      cjsFiles = new Set();

    Object.values(es).forEach(group => {
      group.forEach(record => {
        if (record.filePath) {
          esmFiles.add(record.filePath);
        }
      });
    });

    is.importDeclaration.forEach(record => esmFiles.add(record.filePath));

    func.all.forEach(record => esmFiles.add(record.filePath));

    Object.values(cjs).forEach(group => {
      group.forEach(record => {
        // ESM signature is for sure, but CJS is not
        // When a file is ambiguous, count it as ESM
        if (!esmFiles.has(record.filePath)) {
          cjsFiles.add(record.filePath);
        }
      });
    });

    return {
      'esm-files': esmFiles.size,
      'cjs-files': cjsFiles.size,
      'feature-usage-esm-against-cjs': esmFiles.size / (esmFiles.size + cjsFiles.size),
    };
  }
};
