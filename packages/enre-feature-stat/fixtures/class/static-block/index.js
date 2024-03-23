import {pmax} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-classes', 'class-static-block'],
  process: (clz, sbs, isTraceMode) => {
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
      'all-classes': allClassesCount,
      'class-with-static-block': classWithStaticBlockCount,
      'feature-usage-against-class': classWithStaticBlockCount / allClassesCount,

      'max-count-of-static-block-in-class': pmax(Object.values(classWithStaticBlock)),

      'trace|class-with-static-block': isTraceMode ?
        sbs.map(sb => `${sb.filePath}#L${sb.staticBlockStartLine}`)
        : undefined,
    };
  },
};
