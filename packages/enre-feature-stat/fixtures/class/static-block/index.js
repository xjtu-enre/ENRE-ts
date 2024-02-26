import {toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-classes', 'class-static-block'],
  process: (clz, sbs) => {
    const classWithStaticBlock = {};

    for (const sb of sbs) {
      if (classWithStaticBlock[sb.classOid] === undefined) {
        classWithStaticBlock[sb.classOid] = 1;
      } else {
        classWithStaticBlock[sb.classOid] += 1;
      }
    }

    const
      allClassesCount = clz.allClasses.length,
      classWithStaticBlockCount = Object.keys(classWithStaticBlock).length;

    return {
      'class/static-block': {
        'all-classes': allClassesCount,
        'class-with-static-block': classWithStaticBlockCount,
        'feature-usage-against-class': toFixed(classWithStaticBlockCount / allClassesCount),

        'max-count-of-static-block-in-class': Math.max(...Object.values(classWithStaticBlock)),
      }
    };
  },
};
