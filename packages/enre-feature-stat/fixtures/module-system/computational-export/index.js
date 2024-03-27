import {groupCountBy} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-export-declarations'],
  process: (res) => {
    const
      allCount = res.defaultExportNonDecl.length + res.declarationExport.filter(decl => decl.isDefault).length,
      featedCount = res.defaultExportNonDecl.filter(e => !['Identifier', 'ObjectLiteralExpression', 'ArrayLiteralExpression', 'ArrowFunction', 'AsExpression', 'NoSubstitutionTemplateLiteral', 'StringLiteral', 'NumericLiteral', 'FunctionExpression', 'ClassExpression'].includes(e.expressionNodeType)).length,
      groups = groupCountBy(res.defaultExportNonDecl, 'expressionNodeType');


    return {
      'all-export-default-declarations': allCount,
      'export-default-with-expression': featedCount,
      'feature-usage-against-export-default-declaration': featedCount / allCount,

      'types': groups,
    };
  }
};
