import {toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['exported-name-with-multi-roles'],
  process: (res) => {
    const allExportNames = new Set();

    let multiRolesNameExportedCount = 0;

    res.allExportName.forEach(record => allExportNames.add(`${record.filePath}:${record.localName}`));

    res.nameWithMultiRoles.forEach(record => {
      if (allExportNames.has(`${record.filePath}:${record.name}`)) {
        multiRolesNameExportedCount += 1;
      }
    });

    const
      allCount = allExportNames.size,
      featedCount = multiRolesNameExportedCount,
      notExported = res.nameWithMultiRoles.length - featedCount;

    return {
      'all-export-names': allCount,
      'export-name-with-multi-roles': featedCount,
      'feature-usage-against-export-name': toFixed(featedCount / allCount),

      'types': {
        'exported': featedCount,
        'not-exported': notExported,
      }
    };
  }
};
