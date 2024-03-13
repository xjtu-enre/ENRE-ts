export default {
  dependencies: ['class-constructor-params'],
  process: (res) => {
    /**
     * Constructor
     * | Param
     *   | hasModifier
     */
    const data = {};

    for (const param of res.allParams) {
      if (!data[param.constructorOid]) {
        data[param.constructorOid] = {};
      }

      data[param.constructorOid][param.paramOid] = false;
    }

    for (const modifier of res.modifiers) {
      data[modifier.constructorOid][modifier.paramOid] = true;
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
      }
    };
  }
};
