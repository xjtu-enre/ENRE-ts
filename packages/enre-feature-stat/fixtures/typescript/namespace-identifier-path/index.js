import {pmax, resolveNestingRelation, toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-namespaces'],
  process: (res) => {
    const
      idMap = new Map(),
      [nodes, relLengths] = resolveNestingRelation(res, 'nsOid', 'parentOid');

    res.forEach(ns => idMap.set(ns.nsOid, ns));

    let overlappedNs = 0;

    for (const [, node] of nodes.entries()) {
      if (!node.prev && node.next.length > 1) {
        const groupChildByName = new Map();
        for (const child of node.next) {
          const
            ns = idMap.get(child.oid),
            nsName = ns.nsName;
          if (!groupChildByName.has(nsName)) {
            groupChildByName.set(nsName, []);
          }

          groupChildByName.get(nsName).push(child.next);
        }

        for (const nameGroup of groupChildByName.values()) {
          // This excludes the scenario where two `namespace A` performing declaration merging
          if (nameGroup.length > 1 && !nameGroup.every(next => next.length === 0)) {
            overlappedNs += nameGroup.length;
          }
        }
      }
    }

    const
      allCount = relLengths.length,
      featedCount = relLengths.filter(l => l > 2).length,
      maxPathLength = pmax(relLengths) - 1;

    return {
      'all-namespace-declarations': allCount,
      'namespace-with-identifier-path': featedCount,
      'feature-usage-against-namespace-declaration': toFixed(featedCount / allCount),

      'namespaces-with-overlapped-name': overlappedNs,
      'feature-usage-against-namespace-with-identifier-path': toFixed(overlappedNs / featedCount),

      'max-count-of-identifier-path-length': maxPathLength > 0 ? maxPathLength : -1,
    };
  }
};
