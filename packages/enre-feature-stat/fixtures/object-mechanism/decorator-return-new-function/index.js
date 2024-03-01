import {toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-decorator-functions-and-usages'],
  process: (res) => {
    let
      decFuncs = new Set();

    for (const callsite of res.userDefinedDecoratorCallsite) {
      decFuncs.add(callsite.decoratorFunctionOid);
    }

    const
      returnsNew = res.decoratorReturnsNew.length;

    return {
      'decorator-functions': decFuncs.size,
      'decorator-returns-new': returnsNew,
      'feature-usage-against-user-defined-decorator-function': toFixed(returnsNew / decFuncs.size),
    };
  },
};
