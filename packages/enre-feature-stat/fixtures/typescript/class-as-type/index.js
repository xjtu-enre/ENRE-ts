import {toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-classes', 'class-as-type-usage'],
  process: (clz, usages) => {
    const
      clzDeclCount = clz.allClasses.filter(c => c.classType === 'ClassDeclaration').length,
      featedClzCount = new Set(usages.map(usage => usage.classOid)).size;

    return {
      'all-class-declarations': clzDeclCount,
      'class-used-in-type-context': featedClzCount,
      'feature-usage-against-class-declaration': toFixed(featedClzCount / clzDeclCount),
    };
  }
};
