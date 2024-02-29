import {toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['first-class-citizens-added-prop', 'all-functions', 'all-classes'],
  process: (res, func, clz) => {
    const
      modifiedFunctions = new Set(),
      modifiedClasses = new Set(),
      functionChangedToWhat = {},
      classChangedToWhat = {};

    let
      // See post process script of 'first-class-citizen-modify-prop'
      pruneFunction = 0,
      pruneClass = 0;

    for (const callsite of res) {
      if (callsite.leftNodeType !== 'Identifier') {
        continue;
      }

      if (callsite.citizenType === 'Function') {
        modifiedFunctions.add(callsite.citizenOid);

        if (functionChangedToWhat[callsite.rightNodeType] === undefined) {
          functionChangedToWhat[callsite.rightNodeType] = 0;
        }
        functionChangedToWhat[callsite.rightNodeType] += 1;
      } else if (callsite.citizenType === 'Class') {
        modifiedClasses.add(callsite.citizenOid);

        if (classChangedToWhat[callsite.rightNodeType] === undefined) {
          classChangedToWhat[callsite.rightNodeType] = 0;
        }
        classChangedToWhat[callsite.rightNodeType] += 1;
      }

      if (callsite.rightNodeType === 'FunctionExpression') {
        pruneFunction += 1;
      } else if (callsite.rightNodeType === 'ClassExpression') {
        pruneClass += 1;
      }
    }

    const
      allFunctionsAndClasses = func.length + clz.allClasses.length - pruneFunction - pruneClass,
      modifiedCitizens = modifiedFunctions.size + modifiedClasses.size;

    return {
      'all-functions-and-classes': allFunctionsAndClasses,
      'modified-functions': modifiedFunctions.size,
      'modified-classes': modifiedClasses.size,
      'feature-usage-against-function-and-class': toFixed(modifiedCitizens / allFunctionsAndClasses),

      'function-changed-to-what': functionChangedToWhat,
      'class-changed-to-what': classChangedToWhat,
    };
  }
};
