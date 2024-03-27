import {pmax, resolveNestingRelation} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-functions', 'function-with-dest-param', 'binding-pattern-nesting-relation'],
  process: (funcs, feated, rels) => {
    const
      destedRestParamFunctionIDs = new Set(),
      nonRestDestPatternIDs = [],
      restDestPatternIDs = [];

    for (const param of feated.param) {
      if (param.isRestParam) {
        destedRestParamFunctionIDs.add(param.functionOid);
        restDestPatternIDs.push(param.paramNameNodeOid);
      } else {
        nonRestDestPatternIDs.push(param.paramNameNodeOid);
      }
    }

    const [, nonRestRelLengths] = resolveNestingRelation(
      rels,
      'nodeOid',
      'parentNodeOid',
      {
        onTop: (oid) => nonRestDestPatternIDs.includes(oid)
      }
    );

    const [, restRelLengths] = resolveNestingRelation(
      rels,
      'nodeOid',
      'parentNodeOid',
      {
        onTop: (oid) => restDestPatternIDs.includes(oid)
      }
    );

    const
      funcCount = funcs.length,
      funcWithDPCount = feated.function.length,
      funcWithDestParamCount = destedRestParamFunctionIDs.size;

    return {
      'all-functions': funcCount,
      'function-with-dest-param': funcWithDPCount,
      'function-with-dest-rest-param': funcWithDestParamCount,

      'feature-usage-dest-param-against-function': funcWithDPCount / funcCount,
      'feature-usage-dest-rest-param-against-function': funcWithDestParamCount / funcCount,

      'max-count-of-rest-param-dest-pattern-nesting-depth': pmax(restRelLengths),
      'max-count-of-non-rest-param-dest-pattern-nesting-depth': pmax(nonRestRelLengths),
    };
  },
};
