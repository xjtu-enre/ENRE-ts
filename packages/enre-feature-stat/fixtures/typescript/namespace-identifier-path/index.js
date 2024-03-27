import {pmax, resolveNestingRelation} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-namespaces'],
  process: (res, isTraceMode) => {
    const
      idMap = new Map(),
      relLenTopOids = [],
      [nodes, relLengths] = resolveNestingRelation(
        res,
        'nsOid',
        'parentOid',
        {
          onTop: (oid) => {
            relLenTopOids.push(oid);
            return true;
          }
        }
      );

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
      maxPathLength = pmax(relLengths) - 1,
      traceObj = res.find(x => x.parentOid === relLenTopOids[pmax(Object.entries(relLengths), 1)[0]]);


    return {
      'all-namespace-declarations': allCount,
      'namespace-with-identifier-path': featedCount,
      'feature-usage-against-namespace-declaration': featedCount / allCount,

      'namespaces-with-overlapped-name': overlappedNs,
      'feature-usage-against-namespace-with-identifier-path': overlappedNs / featedCount,

      'max-count-of-identifier-path-length': maxPathLength > 0 ? maxPathLength : -1,

      'trace|max-count-of-identifier-path-length': isTraceMode ?
        (traceObj ? `${traceObj.filePath}#L${traceObj.nsStartLine}` : undefined)
        : undefined,
    };
  }
};
