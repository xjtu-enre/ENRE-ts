import ArrowFunctionExpression from './ArrowFunctionExpression';
import AssignmentExpression from './AssignmentExpression';
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

export default {
  'VariableDeclaration': VariableDeclaration,
  'FunctionDeclaration|FunctionExpression': FunctionDeclaration,
  'ArrowFunctionExpression': ArrowFunctionExpression,
  'CatchClause': CatchClause,
  'ClassDeclaration|ClassExpression': ClassDeclaration,
  'ClassProperty|ClassPrivateProperty': ClassProperty,
  'ClassMethod|ClassPrivateMethod|TSDeclareMethod': ClassMethod,
  'ObjectExpression': ObjectExpression,
  'TSPropertySignature': TSPropertySignature,
  'TSCallSignatureDeclaration': TSCallSignatureDeclaration,
  'TSConstructSignatureDeclaration': TSConstructSignatureDeclaration,
  // 'TSMethodSignature': TSMethodSignature,
  'TSIndexSignature': TSIndexSignature,
  'TSModuleDeclaration': TSModuleDeclaration,
  'TSTypeAliasDeclaration': TSTypeAliasDeclaration,
  'TSEnumDeclaration': TSEnumDeclaration,
  'TSEnumMember': TSEnumMember,
  'TSInterfaceDeclaration': TSInterfaceDeclaration,
  'TSTypeParameterDeclaration': TSTypeParameterDeclaration,

  'ImportDeclaration': ImportDeclaration,
  'ExportNamedDeclaration': ExportNamedDeclaration,
  'ExportAllDeclaration': ExportAllDeclaration,
  'ExportDefaultDeclaration': ExportDefaultDeclaration,
  'AssignmentExpression': AssignmentExpression,
  'UpdateExpression': UpdateExpression,
  'Decorator': Decorator,

  'ExpressionStatement': ExpressionStatement,
};
