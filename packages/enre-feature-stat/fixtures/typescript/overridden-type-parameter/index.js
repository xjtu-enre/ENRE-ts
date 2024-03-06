import {pmax, toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-type-parameters', 'type-parameter-overridden-usage'],
  process: (all, feated) => {
    const
      allCount = all.length,
      featedCount = feated.reduce((p, c) => {
        p.add(c.tp1Oid);
        p.add(c.tp2Oid);
        return p;
      }, new Set()).size;

    /**
     * The overridden relations form multiple trees, with different path may converge to
     * the same node, that is, a node may have multiple parents. The following code calculate
     * the path length from the tree top down to the tree bottom. We don't use the lib
     * function because multiple parents are not supported in it.
     */
    const nodes = new Map();
    for (const {tp1Oid, tp2Oid} of feated) {
      if (!nodes.has(tp1Oid)) {
        nodes.set(tp1Oid, {id: tp1Oid, prev: [], next: []});
      }
      if (!nodes.has(tp2Oid)) {
        nodes.set(tp2Oid, {id: tp2Oid, prev: [], next: []});
      }
      nodes.get(tp1Oid).next.push(tp2Oid);
      nodes.get(tp2Oid).prev.push(tp1Oid);
    }

    const lengths = [];
    for (const node of nodes.values()) {
      if (node.prev.length === 0) {
        const stack = [{node, length: 1}];
        while (stack.length > 0) {
          const {node, length} = stack.pop();
          if (node.next.length === 0) {
            lengths.push(length);
          } else {
            for (const next of node.next) {
              stack.push({node: nodes.get(next), length: length + 1});
            }
          }
        }
      }
    }

    return {
      'all-type-parameters': allCount,
      'type-parameters-in-overriding-usage': featedCount,
      'feature-usage-against-type-parameter': toFixed(featedCount / allCount),

      'max-count-of-overridden-type-parameter-chain-length': pmax(lengths),
    };
  }
};
