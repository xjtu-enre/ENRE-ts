export default {
  dependencies: ['symbol-usages'],
  process: (res) => {
    const
      grouped = res.reduce((p, c) => {
        if (!(c.symbolName in p)) {
          p[c] = {};
        }

        if (!(c.valueNodeType in p[c.symbolName])) {
          p[c.symbolName][c.valueNodeType] = 0;
        }

        p[c.symbolName][c.valueNodeType] += 1;
      }, {});

    return {
      'all-symbol-usages': res.length,

      'types': grouped,
    };
  }
};
