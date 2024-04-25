export default {
  dependencies: ['class-constructor-params'],
  process: (res, isTraceMode) => {
    /**
     * Constructor
     * | Param
     *   | hasModifier
     */
    const data = {}, map = new Map();

    for (const param of res.allParams) {
      if (!data[param.constructorOid]) {
        data[param.constructorOid] = {};
        map.set(param.constructorOid.toString(), `${param.filePath}#L${param.constructorStartLine}`);
      }

      data[param.constructorOid][param.paramOid] = false;
    }

    for (const modifier of res.modifiers) {
      // Parent constructor may be pruned due to ignore file patterns
      if (modifier.constructorOid in data) {
        data[modifier.constructorOid][modifier.paramOid] = true;
      }
    }

    const
      allClassConstructors = Object.keys(data).length,
      pureParameter = Object.values(data).filter(params => Object.values(params).every(Boolean)).length,
      mixedFieldAndParameter = Object.values(data).filter(params => Object.values(params).some(Boolean) && Object.values(params).some(v => !v)).length,
      pureField = Object.values(data).filter(params => Object.values(params).every(v => !v)).length;

    return {
      'all-class-constructors': allClassConstructors,
      'feature-usage-against-class-constructor': mixedFieldAndParameter / allClassConstructors,

      'types': {
        'pure-parameter': pureParameter,
        'mixed-field-and-parameter': mixedFieldAndParameter,
        'pure-field': pureField,
      },

      'trace|types/mixed-field-and-parameter': (isTraceMode && (mixedFieldAndParameter > 0)) ?
        Object.entries(data)
          .filter(([, v]) => Object.values(v).some(Boolean) && Object.values(v).some(v => !v))
          .map(([oid]) => map.get(oid))
        : undefined,
    };
  }
};
