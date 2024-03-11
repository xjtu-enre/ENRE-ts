import {groupCountBy, toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-object-creations', 'all-functions'],
  process: (res, funcs) => {
    const
      objectLiteral = res.objectLiteral.length,
      objectFunction = res.objectFunction.length,
      objectFunctionArgTypes = groupCountBy(res.objectFunction, 'argNodeType'),
      objectConstructor = res.objectConstructor.length,
      objectConstructorArgTypes = groupCountBy(res.objectConstructor, 'argNodeType'),
      objectAPI = res.objectAPI.length,
      objectAPIArgTypes = groupCountBy(res.objectAPI, 'argNodeType'),
      functionLiteral = funcs.length,
      functionFunction = res.functionFunction.length,
      functionFunctionArgTypes = groupCountBy(res.functionFunction, 'argNodeType'),
      functionConstructor = res.functionConstructor.length,
      functionConstructorArgTypes = groupCountBy(res.functionConstructor, 'argNodeType'),
      stringLiteral = res.stringLiteral.length,
      stringFunction = res.stringFunction.length,
      stringFunctionArgTypes = groupCountBy(res.stringFunction, 'argNodeType'),
      stringConstructor = res.stringConstructor.length,
      stringConstructorArgTypes = groupCountBy(res.stringConstructor, 'argNodeType'),
      numericLiteral = res.numericLiteral.length,
      numberFunction = res.numberFunction.length,
      numberFunctionArgTypes = groupCountBy(res.numberFunction, 'argNodeType'),
      numberConstructor = res.numberConstructor.length,
      numberConstructorArgTypes = groupCountBy(res.numberConstructor, 'argNodeType'),
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
        'api': objectAPI,
        'api-arg-types': objectAPIArgTypes,
      },
      'types-object-function-arg-types': objectFunctionArgTypes,
      'types-object-constructor-arg-types': objectConstructorArgTypes,

      'types-function': {
        'literal': functionLiteral,
        'function': functionFunction,
        'constructor': functionConstructor,
      },
      'types-function-function-arg-types': functionFunctionArgTypes,
      'types-function-constructor-arg-types': functionConstructorArgTypes,

      'types-string': {
        'literal': stringLiteral,
        'function': stringFunction,
        'constructor': stringConstructor,
      },
      'string-function-arg-types': stringFunctionArgTypes,
      'string-constructor-arg-types': stringConstructorArgTypes,

      'types-number': {
        'literal': numericLiteral,
        'function': numberFunction,
        'constructor': numberConstructor,
      },
      'types-number-function-arg-types': numberFunctionArgTypes,
      'types-number-constructor-arg-types': numberConstructorArgTypes,
    };
  }
};
