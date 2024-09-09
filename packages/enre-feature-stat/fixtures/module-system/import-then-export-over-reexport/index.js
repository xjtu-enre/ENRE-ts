export default {
  dependencies: ['import-then-export-usage', 'all-export-declarations'],
  process: (feated, all, isTraceMode) => {
    const deduped = new Map();

    feated.forEach(record => {
      const key = record.filePath + ':' + record.usageName;
      if (deduped.has(key) && record.isUsed) {
        deduped.set(key, record);
      } else if (!deduped.has(key)) {
        deduped.set(key, record);
      }
    });

    const
      reexportCount = all.reexport.length,
      importThenExportCount = feated.filter(record => !record.isUsed).length,
      allCount = reexportCount + importThenExportCount;

    return {
      'all-reexport-likes': allCount,
      'import-then-export': importThenExportCount,
      'feature-usage-against-reexport-like': importThenExportCount / allCount,

      'trace|import-then-export': isTraceMode ?
        [...deduped.values()].filter(x => !x.isUsed)
          .map(x => `${x.filePath}#L${Math.min(x.importStartLine, x.exportStartLine)}-L${Math.max(x.importStartLine, x.exportStartLine)}`)
        : undefined,
    };
  }
};
