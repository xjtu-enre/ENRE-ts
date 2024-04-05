export default {
  dependencies: ['first-class-citizens-added-prop', 'all-functions', 'all-classes'],
  process: (res, func, clz, isTraceMode) => {
    const
      modifiedFunctions = new Set(),
      modifiedClasses = new Set(),
      addWhatToFunction = {},
      addWhatToClass = {},
      functionCallsites = [],
      classCallsites = [];

    let
      /**
       * If a function/class is added to a citizen's property, the function itself can
       * also have property added, however it is hard to detect in Godel, so we remove
       * these function/class from all functions/classes.
       */
      pruneFunction = 0,
      pruneClass = 0;

    for (const callsite of res) {
      const locDifference = Math.abs(callsite.citizenStartLine - callsite.callsiteStartLine);
      // Trying to fix godel bug by spacial correlation
      // if (locDifference > 50) {
      //   continue;
      // }

      // Exclude compressed code
      if (locDifference < 3) {
        continue;
      }

      // See 'reassign to declaration name'
      if (callsite.leftNodeType === 'Identifier') {
        continue;
      }

      if (callsite.citizenType === 'Function') {
        modifiedFunctions.add(callsite.citizenOid);

        if (addWhatToFunction[callsite.rightNodeType] === undefined) {
          addWhatToFunction[callsite.rightNodeType] = 0;
        }
        addWhatToFunction[callsite.rightNodeType] += 1;

        if (isTraceMode) {
          functionCallsites.push(`${callsite.filePath}#L${callsite.citizenStartLine}-L${callsite.callsiteStartLine}`);
        }
      } else if (callsite.citizenType === 'Class') {
        modifiedClasses.add(callsite.citizenOid);

        if (addWhatToClass[callsite.rightNodeType] === undefined) {
          addWhatToClass[callsite.rightNodeType] = 0;
        }
        addWhatToClass[callsite.rightNodeType] += 1;

        if (isTraceMode) {
          classCallsites.push(`${callsite.filePath}#L${callsite.citizenStartLine}-L${callsite.callsiteStartLine}`);
        }
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
      'feature-usage-against-function-and-class': modifiedCitizens / allFunctionsAndClasses,

      'add-what-to-function': addWhatToFunction,
      'add-what-to-class': addWhatToClass,

      'trace|modified-functions': isTraceMode ? functionCallsites : undefined,
      'trace|modified-classes': isTraceMode ? classCallsites : undefined,
    };
  }
};
