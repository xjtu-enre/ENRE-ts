// Positive numbers' max, will return -1 if parameter length is 0
export function pmax(arr, key = undefined) {
  if (arr.length === 0) return -1;

  if (key === undefined) {
    return arr.reduce((prev, curr) => Math.max(prev, curr), -1);
  } else {
    return arr.reduce((prev, curr) => prev[key] > curr[key] ? prev : curr, {[key]: -1});
  }
}

export function resolveNestingRelation(
  data,
  IDKey,
  parentIDKey,
  // Hooks
  {
    /**
     * Whether to record this value in the result.
     *
     * @param {number} IDKey
     * @returns {boolean}
     */
    onTop
  } = {},
) {
  // Use linked list to form the nesting relation from p2p relations
  // A parent can have multiple children, but a child can only have one parent
  const
    nodes = new Map(),
    relLengths = [];

  for (const rel of data) {
    for (const oid of [rel[IDKey], rel[parentIDKey]]) {
      if (!nodes.has(oid)) {
        nodes.set(oid, {prev: undefined, oid, next: []});
      }
    }

    // Link two vertexes to an edge
    nodes.get(rel[parentIDKey]).next.push(nodes.get(rel[IDKey]));

    if (nodes.get(rel[IDKey]).prev) {
      throw new Error('Linked list is going to branch, which should not happen');
    } else {
      nodes.get(rel[IDKey]).prev = nodes.get(rel[parentIDKey]);
    }
  }

  /**
   * Count the longest relation's length from the tail node (so that avoid branching)
   */
  for (const node of nodes.values()) {
    if (node.next.length === 0) {
      let length = 1;
      let topNode = undefined;
      for (let p = node.prev; p; p = p.prev) {
        length += 1;

        if (!p.prev) {
          topNode = p;
        }
      }

      if (!onTop || onTop(topNode.oid))
        relLengths.push(length);
    }
  }

  return [nodes, relLengths];
}

export function groupCountBy(data, key) {
  const result = {};

  for (const item of data) {
    const group = item[key];

    if (!(group in result)) {
      result[group] = 0;
    }

    result[group] += 1;
  }

  return result;
}
