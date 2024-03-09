import {toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-export-declarations', 'all-import-declarations', 'import-function-callsite'],
  process: (es, is, funcCall) => {
    const
      allModuleSpecifiers = new Set();

    es.reexport.forEach(r => allModuleSpecifiers.add(r.moduleSpecifier));
    is.importDeclaration.forEach(i => allModuleSpecifiers.add(i.moduleSpecifier));
    // Remove the quotes
    funcCall.forEach(f => f.argNodeType === 'StringLiteral' && allModuleSpecifiers.add(f.argText.substring(1, -1)));

    const
      allCount = allModuleSpecifiers.size;

    let featedCount = 0;
    allModuleSpecifiers.forEach(ms => {
      if (ms.startsWith('#')) {
        featedCount += 1;
      }
    });

    return {
      'all-module-specifiers': allCount,
      'subpath-module-specifier': featedCount,
      'feature-usage-against-module-specifier': toFixed(featedCount / allCount),
    };
  }
};
