export default {
  dependencies: ['exported-name-with-multi-roles'],
  process: (res, isTraceMode) => {
    const allExportNames = new Set(), participants = {}, exportedRecord = [];

    let multiRolesNameExportedCount = 0;

    res.allExportName.forEach(record => allExportNames.add(`${record.filePath}:${record.localName}`));

    res.nameWithMultiRoles.forEach(record => {
      if (allExportNames.has(`${record.filePath}:${record.name}`)) {
        multiRolesNameExportedCount += 1;
        exportedRecord.push(record);
      }

      const participantKey = [record.valueType, record.typeType]
        .sort((a, b) => a < b)
        .join('/');
      if (!participants[participantKey]) {
        participants[participantKey] = 0;
      }

      participants[participantKey] += 1;
    });

    const
      allCount = allExportNames.size,
      featedCount = multiRolesNameExportedCount,
      notExported = res.nameWithMultiRoles.length - featedCount;

    return {
      'all-export-names': allCount,
      'export-name-with-multi-roles': featedCount,
      'feature-usage-against-export-name': featedCount / allCount,

      'types-export': {
        'exported': featedCount,
        'not-exported': notExported,
      },

      'types-participant': participants,

      'trace|types/exported': isTraceMode ?
        exportedRecord.map(x => `${x.filePath}#L${Math.min(x.valueStartLine, x.typeStartLine)}-L${Math.max(x.valueStartLine, x.typeStartLine)}`)
        : undefined,
    };
  }
};
