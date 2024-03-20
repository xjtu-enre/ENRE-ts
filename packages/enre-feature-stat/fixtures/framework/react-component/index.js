import {pmax} from '../../_utils/post-process.js';

export default {
  dependencies: [
    'react-class-components-and-lifecycle-methods',
    'react-function-components-and-hook-callsites',
    'llm-invocation-on-react-class-component-methods'
  ],
  process: (cc, fc, llm) => {
    const
      ccCount = cc.reactClassComponent.length,
      fcCount = fc.maybeReactFunctionComponent.length,
      fcHookCalls = {};

    for (const hookCall of fc.reactFunctionComponentHookCall) {
      if (fcHookCalls[hookCall.functionOid] === undefined) {
        fcHookCalls[hookCall.functionOid] = {
          useState: hookCall.hookCalleeStandardName === 'useState' ? 1 : 0,
          useEffect: hookCall.hookCalleeStandardName === 'useEffect' ? 1 : 0,
        };
      } else {
        fcHookCalls[hookCall.functionOid][hookCall.hookCalleeStandardName] += 1;
      }
    }

    return {
      'all-react-components': ccCount + fcCount,
      'class-component': ccCount,
      'function-component': fcCount,
      'types': {
        'class-component': ccCount,
        'function-component': fcCount,
      },
      
      'max-count-of-intends-in-a-class-component-lifecycle-method': pmax(Object.values(llm).map(r => r.intentCount)),

      'max-count-of-useState-hook-calls-in-fc': pmax(Object.values(fcHookCalls).map(hookCalls => hookCalls.useState)),
      'max-count-of-useEffect-hook-calls-in-fc': pmax(Object.values(fcHookCalls).map(hookCalls => hookCalls.useEffect)),
    };
  },
};
