export default {
  'all-binary-expressions': {
    FP: ['.'],
    LN: [['exprStartLine']],
    EX: [['operator']],
  },
  'all-class-members': {
    FP: ['.'],
    LN: [['memberStartLine']],
    EX: [[]],
  },
  'all-classes': {
    FP: ['allClasses/.'],
    LN: [['startLine']],
    EX: [[]],
  },
  // 'all-decorator-functions-and-usages': {
  //   FP: ['userDefinedDecoratorCallsite/callsiteFilePath'],
  //   LN: [[]],
  //   EX: [[]],
  // },
  'all-enum-members': {
    FP: ['.'],
    LN: [['enumMemberStartLine']],
    EX: [[]],
  },
  'all-enums': {
    FP: ['allEnums/.'],
    LN: [['enumStartLine']],
    EX: [[]],
  },
  'all-export-declarations': {
    FP: ['defaultExportNonDecl/.', 'declarationExport/.', 'namedExport/.', 'reexport/.'],
    LN: [['declStartLine'], ['declStartLine'], ['declStartLine'], ['declStartLine']],
    EX: [[], [], [], ['isNamespaceExport_SB', 'isNamespaceExportRenamed_SB', 'isNamedExports_SB']],
  },
  // 'all-files': ['.'],
  'all-functions': {
    FP: ['.'],
    LN: [['functionStartLine']],
    EX: [[]],
  },
  'all-import-declarations': {
    FP: ['importDeclaration/.'],
    LN: [['declarationStartLine']],
    EX: [[]]
  },
  'all-namespaces': {
    FP: ['.'],
    LN: [['nsStartLine']],
    EX: [['nsStartColumn', 'nsName']]
  },
  'all-object-creations': {
    FP: ['objectFunction/.', 'objectConstructor/.', 'objectAPI/.', 'functionFunction/.', 'functionConstructor/.', 'stringFunction/.', 'stringConstructor/.', 'numberFunction/.', 'numberConstructor/.'],
    LN: [['callsiteStartLine'], ['callsiteStartLine'], ['apiCallsiteStartLine'], ['callsiteStartLine'], ['callsiteStartLine'], ['callsiteStartLine'], ['callsiteStartLine'], ['callsiteStartLine'], ['callsiteStartLine']],
    EX: [[], [], [], [], [], [], [], [], []],
  },
  'all-standalone-blocks': {
    FP: ['generalStandaloneBlock/.', 'switchCaseClauseStandaloneBlock/.'],
    LN: [['blockStartLine'], ['caseClauseStartLine']],
    EX: [['hasDeclaration_SB'], []],
  },
  'all-type-parameters': {
    FP: ['.'],
    LN: [['tpStartLine']],
    EX: [['tpStartColumn']],
  },
  'all-variable-declarations': {
    FP: ['variableStatement/.'],
    LN: [['nodeStartLine']],
    EX: [[]],
  },
  // 'binding-pattern-nesting-relation': [],
  'cjs-file': {
    FP: ['requireFunctionCall/.', 'moduleExportsXXX/.'],
    LN: [['callsiteStartLine'], ['usageStartLine']],
    EX: [[], []],
  },
  'class-as-type-usage': {
    FP: ['.'],
    LN: [['classStartLine', 'typeUsageStartLine']],
    EX: [['typeUsageStartColumn']],
  },
  'class-constructor-params': {
    FP: ['allParams/.'],
    LN: [['constructorStartLine', 'paramStartLine']],
    EX: [[]],
  },
  'class-static-block': {
    FP: ['.'],
    LN: [['staticBlockStartLine']],
    EX: [[]],
  },
  'class-with-extension': {
    FP: ['dynamicHeritageUsage/.'],
    LN: [['classStartLine', 'heritageExprStartLine']],
    EX: [[]],
  },
  'class-with-implement': {
    FP: ['.'],
    LN: [['implStartLine']],
    EX: [['typeCount']],
  },
  // 'comma-elision-decl': [],
  'declaration-merging-usage': {
    FP: ['.'],
    LN: [['mergingNodeAStartLine', 'mergingNodeBStartLine']],
    EX: [['mergingName', 'mergingNodeAType', 'mergingNodeBType']],
  },
  'exported-name-with-multi-roles': {
    FP: ['nameWithMultiRoles/.'],
    LN: [['valueStartLine', 'typeStartLine']],
    EX: [['name', 'valueType', 'typeType']],
  },
  'first-class-citizens-added-prop': {
    FP: ['.'],
    LN: [['citizenStartLine', 'callsiteStartLine']],
    EX: [[]],
  },
  'function-using-arguments': {
    FP: ['argumentsContext/.'],
    LN: [['argumentsStartLine']],
    EX: [[]],
  },
  'function-using-this': {
    FP: ['thisContext/.'],
    LN: [['thisStartLine']],
    EX: [[]],
  },
  'function-with-dest-param': {
    FP: ['function/.'],
    LN: [['functionStartLine']],
    EX: [[]],
  },
  'function-with-parameter-this': {
    FP: ['.'],
    LN: [['thisStartLine']],
    EX: [[]],
  },
  'import-function-callsite': {
    FP: ['all/.'],
    LN: [['callsiteStartLine']],
    EX: [[]],
  },
  'import-then-export-usage': {
    FP: ['.'],
    LN: [['importStartLine', 'exportStartLine']],
    EX: [['isUsed_SB']],
  },
  'interface-with-heritage': {
    FP: ['.'],
    LN: [['extendsStartLine']],
    EX: [[]],
  },
  'modify-to-prototype': {
    FP: ['.'],
    LN: [['usageStartLine']],
    EX: [['hostName', 'addedName']],
  },
  'react-class-components-and-lifecycle-methods': {
    FP: ['reactClassComponent/.'],
    LN: [['classComponentStartLine']],
    EX: [[]],
  },
  'react-createelement-call': {
    FP: ['.'],
    LN: [['callExprStartLine']],
    EX: [[]],
  },
  'react-function-components-and-hook-callsites': {
    FP: ['maybeReactFunctionComponent/.', 'reactFunctionComponentHookCall/.'],
    LN: [['functionStartLine'], ['callsiteStartLine']],
    EX: [[], ['hookCalleeStandardName', 'hookCalleeLocalName']],
  },
  // 'rest-variable-decl': [],
  // 'standalone-block-nesting-relation': [],
  'symbol-usages': {
    FP: ['.'],
    LN: [['symbolStartLine']],
    EX: [['symbolName']],
  },
  'template-literal-usages': {
    FP: ['.'],
    LN: [['templateLiteralStartLine']],
    EX: [[]],
  },
  // 'type-only-import-and-export': [],
  'type-parameter-overridden-usage': {
    FP: ['.'],
    LN: [['tp1StartLine', 'tp2StartLine']],
    EX: [['tpName']],
  },
};
