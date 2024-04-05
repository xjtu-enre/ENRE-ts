export default {
  dependencies: ['first-class-citizens-added-prop', 'all-functions', 'all-classes'],
  process: (res, func, clz, isTraceMode) => {
    const
      modifiedFunctions = new Set(),
      modifiedClasses = new Set(),
      functionChangedToWhat = {},
      classChangedToWhat = {},
      functionCallsites = [],
      classCallsites = [];

    let
      // See post process script of 'first-class-citizen-modify-prop'
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

      if (callsite.leftNodeType !== 'Identifier') {
        continue;
      }

      if (callsite.citizenType === 'Function') {
        modifiedFunctions.add(callsite.citizenOid);

        if (functionChangedToWhat[callsite.rightNodeType] === undefined) {
          functionChangedToWhat[callsite.rightNodeType] = 0;
        }
        functionChangedToWhat[callsite.rightNodeType] += 1;

        if (isTraceMode) {
          functionCallsites.push(`${callsite.filePath}#L${callsite.citizenStartLine}-L${callsite.callsiteStartLine}`);
        }
      } else if (callsite.citizenType === 'Class') {
        modifiedClasses.add(callsite.citizenOid);

        if (classChangedToWhat[callsite.rightNodeType] === undefined) {
          classChangedToWhat[callsite.rightNodeType] = 0;
        }
        classChangedToWhat[callsite.rightNodeType] += 1;

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

      'function-changed-to-what': functionChangedToWhat,
      'class-changed-to-what': classChangedToWhat,

      'trace|modified-functions': isTraceMode ? functionCallsites : undefined,
      'trace|modified-classes': isTraceMode ? classCallsites : undefined,
    };
  }
};
