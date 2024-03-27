import {pmax} from '../../_utils/post-process.js';

export default {
  dependencies: ['declaration-merging-usage'],
  process: (res) => {
    const data = {};

    for (const rel of res) {
      // Exclude false-positive
      if (rel.mergingNodeAType === 'ModuleDeclaration' && rel.mergingNodeBType === 'InterfaceDeclaration') {
        continue;
      }

      const key = `${rel.parentOid}-${rel.mergingName}`;
      if (!(key in data)) {
        data[key] = {
          participants: new Set(),
          participantTypes: new Set(),
        };
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
      'declaration-merging-usage': usage,
      'max-count-of-merging-elements': maxCount,
      'types': typeCombinations,
    };
  }
};
