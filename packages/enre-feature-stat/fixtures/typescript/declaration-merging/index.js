import {pmax} from '../../_utils/post-process.js';

export default {
  dependencies: ['declaration-merging-usage'],
  process: (res, isTraceMode) => {
    const data = {}, keyMap = new Map();

    for (const rel of res) {
      // Exclude false-positive
      if (rel.mergingNodeAType === 'ModuleDeclaration' && rel.mergingNodeBType === 'InterfaceDeclaration') {
        continue;
      }
      // Functions can not be merged, and in practice, the script detects ambient function declarations in .d.ts
      else if (rel.mergingNodeAType === 'FunctionDeclaration' && rel.mergingNodeBType === 'FunctionDeclaration') {
        continue;
      }

      const key = `${rel.parentOid}-${rel.mergingName}`;
      if (!(key in data)) {
        data[key] = {
          participants: new Set(),
          participantTypes: new Set(),
        };
        keyMap.set(key, `${rel.filePath}#L${rel.mergingNodeAStartLine}`);
      }

      data[key].participants.add(rel.mergingNodeAOid);
      data[key].participantTypes.add(rel.mergingNodeAType);
      data[key].participants.add(rel.mergingNodeBOid);
      data[key].participantTypes.add(rel.mergingNodeBType);
    }

    const
      usage = Object.keys(data).length,
      maxCount = pmax(Object.values(data).map(d => d.participants.size)),
      typeCombinations = Object.values(data)
        .map(d => Array.from(d.participantTypes).sort().join(','))
        .sort()
        .reduce((p, c) => {
          if (!(c in p)) {
            p[c] = 0;
          }

          p[c] += 1;

          return p;
        }, {});

    return {
      'all-declaration-merging-usage': usage,
      'max-count-of-merging-elements': maxCount,
      'types': typeCombinations,

      'trace|max-count-of-merging-elements': isTraceMode ? keyMap.get(pmax(Object.entries(data).map(([k, v]) => [k, v.participants.size]), 1)[0]) : undefined,
      ...(isTraceMode ?
        Object.entries(data)
          .map(([k, v]) => [keyMap.get(k), Array.from(v.participantTypes).sort().join(',')])
          .reduce((p, [k, v]) => ((p['trace|types/' + v] ??= []).push(k), p), {})
        : {}),
    };
  }
};
