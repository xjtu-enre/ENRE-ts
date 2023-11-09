import ArrowFunctionExpression from './ArrowFunctionExpression';
import AssignmentExpression from './AssignmentExpression';
import BlockStatement from './BlockStatement';
import CatchClause from './CatchClause';
import ClassDeclaration from './ClassDeclaration';
import ClassMethod from './ClassMethod';
import ClassProperty from './ClassProperty';
import ExportDefaultDeclaration from './ExportDefaultDeclaration';
import ExportNamedDeclaration from './ExportNamedDeclaration';
import ExpressionStatement from './ExpressionStatement';
import FunctionDeclaration from './FunctionDeclaration';
import ImportDeclaration from './ImportDeclaration';
import ObjectExpression from './ObjectExpression';
import TSCallSignatureDeclaration from './TSCallSignatureDeclaration';
import TSConstructSignatureDeclaration from './TSConstructSignatureDeclaration';
import TSEnumDeclaration from './TSEnumDeclaration';
import TSEnumMember from './TSEnumMember';
import TSIndexSignature from './TSIndexSignature';
import TSInterfaceDeclaration from './TSInterfaceDeclaration';
import TSModuleDeclaration from './TSModuleDeclaration';
import TSPropertySignature from './TSPropertySignature';
import TSTypeAliasDeclaration from './TSTypeAliasDeclaration';
import TSTypeParameterDeclaration from './TSTypeParameterDeclaration';
import UpdateExpression from './UpdateExpression';
import VariableDeclaration from './VariableDeclaration';
import Decorator from './Decorator';
import ExportAllDeclaration from './ExportAllDeclaration';
import TSTypeAnnotation from './TSTypeAnnotation';
import StaticBlock from './StaticBlock';
import TSExportAssignment from './TSExportAssignment';
import TSImportEqualsDeclaration from './TSImportEqualsDeclaration';
import ReturnStatement from './ReturnStatement';

export default {
  'ArrowFunctionExpression': ArrowFunctionExpression,
  'AssignmentExpression': AssignmentExpression,
  'BlockStatement': BlockStatement,
  'CatchClause': CatchClause,
  'ClassDeclaration|ClassExpression': ClassDeclaration,
  'ClassMethod|ClassPrivateMethod|TSDeclareMethod': ClassMethod,
  'ClassProperty|ClassPrivateProperty': ClassProperty,
  'Decorator': Decorator,
  'ExportAllDeclaration': ExportAllDeclaration,
  'ExportDefaultDeclaration': ExportDefaultDeclaration,
  'ExportNamedDeclaration': ExportNamedDeclaration,
  'ExpressionStatement': ExpressionStatement,
  'FunctionDeclaration|FunctionExpression': FunctionDeclaration,
  'ImportDeclaration': ImportDeclaration,
  'ObjectExpression': ObjectExpression,
  'ReturnStatement': ReturnStatement,
  'StaticBlock': StaticBlock,
  'TSCallSignatureDeclaration': TSCallSignatureDeclaration,
  'TSConstructSignatureDeclaration': TSConstructSignatureDeclaration,
  'TSEnumDeclaration': TSEnumDeclaration,
  'TSEnumMember': TSEnumMember,
  'TSExportAssignment': TSExportAssignment,
  'TSImportEqualsDeclaration': TSImportEqualsDeclaration,
  'TSIndexSignature': TSIndexSignature,
  'TSInterfaceDeclaration': TSInterfaceDeclaration,
  //'TSMethodSignature': TSMethodSignature,
  'TSModuleDeclaration': TSModuleDeclaration,
  'TSPropertySignature': TSPropertySignature,
  'TSTypeAliasDeclaration': TSTypeAliasDeclaration,
  'TSTypeAnnotation': TSTypeAnnotation,
  'TSTypeParameterDeclaration': TSTypeParameterDeclaration,
  'UpdateExpression': UpdateExpression,
  'VariableDeclaration': VariableDeclaration,
};
