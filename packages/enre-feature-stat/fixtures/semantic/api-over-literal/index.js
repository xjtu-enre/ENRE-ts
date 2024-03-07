import {toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-object-creations', 'all-functions'],
  process: (res, funcs) => {
    const
      objectLiteral = res.objectLiteral.length,
      objectFunction = res.objectFunction.length,
      objectConstructor = res.objectConstructor.length,
      objectAPI = res.objectAPI.length,
      functionLiteral = funcs.length,
      functionFunction = res.functionFunction.length,
      functionConstructor = res.functionConstructor.length,
      stringLiteral = res.stringLiteral.length,
      stringFunction = res.stringFunction.length,
      stringConstructor = res.stringConstructor.length,
      numericLiteral = res.numericLiteral.length,
      numberFunction = res.numberFunction.length,
      numberConstructor = res.numberConstructor.length,
      allCreations = objectLiteral + objectFunction + objectConstructor + objectAPI + functionLiteral + functionFunction + functionConstructor + stringLiteral + stringFunction + stringConstructor + numericLiteral + numberFunction + numberConstructor,
      featedCount = objectFunction + objectConstructor + objectAPI + functionFunction + functionConstructor + stringFunction + stringConstructor + numberFunction + numberConstructor;

    return {
      'all-heap-object-creation-point': allCreations,
      'creation-is-not-literal': featedCount,
      'feature-usage-against-heap-object-creation-point': toFixed(featedCount / allCreations),

      'types-object': {
        'literal': objectLiteral,
        'function': objectFunction,
        'constructor': objectConstructor,
        'api': objectAPI
      },

      'types-function': {
        'literal': functionLiteral,
        'function': functionFunction,
        'constructor': functionConstructor
      },

      'types-string': {
        'literal': stringLiteral,
        'function': stringFunction,
        'constructor': stringConstructor
      },

      'types-number': {
        'literal': numericLiteral,
        'function': numberFunction,
        'constructor': numberConstructor
      },
    };
  }
};
