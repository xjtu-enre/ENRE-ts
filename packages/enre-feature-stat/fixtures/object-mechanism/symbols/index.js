import {groupCountBy} from '../../_utils/post-process.js';

export default {
  dependencies: ['symbol-usages'],
  process: (res, isTraceMode) => {
    const
      grouped = groupCountBy(res, 'symbolName');

    return {
      'all-symbol-usages': res.length,

      'types': grouped,

      ...(isTraceMode ?
        res.reduce((p, c) => ((p[`trace|types/${c.symbolName}`] ??= []).push(`${c.filePath}#L${c.symbolStartLine}`), p), {})
        : {}),
    };
  }
};
