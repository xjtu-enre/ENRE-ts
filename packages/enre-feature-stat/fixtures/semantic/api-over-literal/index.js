import {groupCountBy} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-object-creations', 'all-functions'],
  process: (res, funcs, isTraceMode) => {
    const
      objectLiteral = res.objectLiteral[0].length,
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
      stringLiteral = res.stringLiteral[0].length,
      stringFunction = res.stringFunction.length,
      stringFunctionArgTypes = groupCountBy(res.stringFunction, 'argNodeType'),
      stringConstructor = res.stringConstructor.length,
      stringConstructorArgTypes = groupCountBy(res.stringConstructor, 'argNodeType'),
      numericLiteral = res.numericLiteral[0].length,
      numberFunction = res.numberFunction.length,
      numberFunctionArgTypes = groupCountBy(res.numberFunction, 'argNodeType'),
      numberConstructor = res.numberConstructor.length,
      numberConstructorArgTypes = groupCountBy(res.numberConstructor, 'argNodeType'),
      allCreations = objectLiteral + objectFunction + objectConstructor + objectAPI + functionLiteral + functionFunction + functionConstructor + stringLiteral + stringFunction + stringConstructor + numericLiteral + numberFunction + numberConstructor,
      featedCount = objectFunction + objectConstructor + objectAPI + functionFunction + functionConstructor + stringFunction + stringConstructor + numberFunction + numberConstructor;

    return {
      'all-heap-object-creation-point': allCreations,
      'creation-is-not-literal': featedCount,
      'feature-usage-against-heap-object-creation-point': featedCount / allCreations,

      'types-object': {
        'literal': objectLiteral,
        'function': objectFunction,
        'constructor': objectConstructor,
        'api': objectAPI,
      },
      'types-object-function-arg-types': objectFunctionArgTypes,
      'types-object-constructor-arg-types': objectConstructorArgTypes,
      'types-object-api-arg-types': objectAPIArgTypes,

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

      'trace|types-object/non-literal': isTraceMode ? [...res.objectFunction, ...res.objectConstructor].map(({
                                                                                                               filePath,
                                                                                                               callsiteStartLine
                                                                                                             }) => `${filePath}#L${callsiteStartLine}`) : undefined,
      'trace|types-function/non-literal': isTraceMode ? [...res.functionFunction, ...res.functionConstructor].map(({
                                                                                                                     filePath,
                                                                                                                     callsiteStartLine
                                                                                                                   }) => `${filePath}#L${callsiteStartLine}`) : undefined,
      'trace|types-string/non-literal': isTraceMode ? [...res.stringFunction, ...res.stringConstructor].map(({
                                                                                                               filePath,
                                                                                                               callsiteStartLine
                                                                                                             }) => `${filePath}#L${callsiteStartLine}`) : undefined,
      'trace|types-number/non-literal': isTraceMode ? [...res.numberFunction, ...res.numberConstructor].map(({
                                                                                                               filePath,
                                                                                                               callsiteStartLine
                                                                                                             }) => `${filePath}#L${callsiteStartLine}`) : undefined,
    };
  }
};
