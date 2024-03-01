import {toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['classes-with-extension'],
  process: (res) => {
    let
      heritageClauseID = new Set(),
      extendsFromParameter = 0,
      extendsFromExpression = 0,
      extendsFromExpressionTypes = {};

    for (const dynamic of res.dynamicHeritageUsage) {
      heritageClauseID.add(dynamic.heritageClauseOid);

      if (dynamic.heritageExprNodeType === 'Identifier') {
        extendsFromParameter += 1;
      } else {
        extendsFromExpression += 1;

        if (extendsFromExpressionTypes[dynamic.heritageExprNodeType] === undefined) {
          extendsFromExpressionTypes[dynamic.heritageExprNodeType] = 0;
        }

        extendsFromExpressionTypes[dynamic.heritageExprNodeType] += 1;
      }
    }

    for (const identifier of res.identifierInHeritageUsage) {
      heritageClauseID.add(identifier.heritageClauseOid);
    }

    const
      classWithExtension = heritageClauseID.size,
      dynamicExtension = res.dynamicHeritageUsage.length;

    return {
      'class-with-extension': classWithExtension,
      'dynamic-extension': dynamicExtension,
      'feature-usage-against-class-with-extension': toFixed(dynamicExtension / classWithExtension),

      'types': {
        'extends-from-parameter': extendsFromParameter,
        'extends-from-expression': extendsFromExpression,
      },

      'extends-from-expression-types': extendsFromExpressionTypes,
    };
  },
};
