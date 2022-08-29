import {createMatchResultContainer} from '../../../../lib/matchers/match-result.js';

export default (obj) => {
  const result = createMatchResultContainer();

  for (const suite of obj.testResults) {
    for (const testcase of suite.testResults) {
      const category = /entity/.test(testcase.title) ? 'entity' : 'relation';

      if (testcase.title.startsWith('only')) {
        continue;
      }

      if (testcase.status === 'passed') {
        result[category].fullyCorrect += 1;
      } else if (testcase.status === 'failed') {
        for (const failureDetail of testcase.failureDetails) {
          if (failureDetail.message?.startsWith('thrown: "Insufficient or wrong predicates to determine only one')) {
            result[category].wrongNode += 1;
          } else if (typeof failureDetail.matcherResult.actual === 'number' && typeof failureDetail.matcherResult.expected === 'number') {
            if (failureDetail.matcherResult.actual === 0 && failureDetail.matcherResult.expected === 1) {
              result[category].missing += 1;
            } else if (failureDetail.matcherResult.actual === 1 && failureDetail.matcherResult.expected === 0) {
              result[category].unexpected += 1;
            }
          } else {
            result[category].wrongProp += 1;
          }
        }
      }
    }
  }

  console.log(result);

  return obj;
}


