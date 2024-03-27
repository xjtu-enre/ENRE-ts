export default {
  dependencies: ['all-binary-expressions'],
  process: (exprs) => {
    let
      normalOp = 0,
      rareOp = 0,
      newOp = 0;

    for (const expr of exprs) {
      if (['*=', '/=', '%=', '+=', '-=', '&=', '^=', '|=', '**='].includes(expr.operator)) {
        normalOp += 1;
      } else if (['<<=', '>>=', '>>>='].includes(expr.operator)) {
        rareOp += 1;
      } else if (['&&=', '||=', '??='].includes(expr.operator)) {
        newOp += 1;
      }
    }

    const allOps = normalOp + rareOp + newOp;

    return {
      'all-binary-operators': allOps,
      'feature-usage-against-operator': (rareOp + newOp) / allOps,
      'types': {
        'normal': normalOp,
        'rare': rareOp,
        'new': newOp,
      }
    };
  },
};
