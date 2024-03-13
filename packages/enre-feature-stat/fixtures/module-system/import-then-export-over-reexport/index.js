export default {
  dependencies: ['import-then-export-usage', 'all-export-declarations'],
  process: (feated, all) => {
    const deduped = new Map();

    feated.forEach(record => {
      const key = record.filePath + ':' + record.usageName;
      if (deduped.has(key) && !record.isUsed) {
        deduped.set(key, record);
      } else if (!deduped.has(key)) {
        deduped.set(key, record);
      }
    });

    const
      values = [...feated.values()],
      reexportCount = all.reexport.length,
      importThenExportCount = values.filter(record => !record.isUsed).length,
      allCount = reexportCount + importThenExportCount;

    return {
      'all-reexport-likes': allCount,
      'import-then-export': importThenExportCount,
      'feature-usage-against-reexport-like': importThenExportCount / allCount,
    };
  }
};
