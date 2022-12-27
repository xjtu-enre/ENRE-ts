import {ENREContext} from '../context';
import ArrowFunctionExpression from './ArrowFunctionExpression';
import AssignmentExpression from './AssignmentExpression';
import CatchClause from './CatchClause';
import ClassDeclaration from './ClassDeclaration';
import ClassMethod from './ClassMethod';
import ClassProperty from './ClassProperty';
import ExportDefaultDeclaration from './ExportDefaultDeclaration';
import ExportNamedDeclaration from './ExportNamedDeclaration';
import FunctionDeclaration from './FunctionDeclaration';
import ImportDeclaration from './ImportDeclaration';
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
import ObjectExpression from './ObjectExpression';

export default (context: ENREContext) => {
  // TODO: Dynamically register and remove methods to support feature cropping.
  return {
    'VariableDeclaration': VariableDeclaration(context),
    'FunctionDeclaration|FunctionExpression': FunctionDeclaration(context),
    'ArrowFunctionExpression': ArrowFunctionExpression(context),
    'CatchClause': CatchClause(context),
    'ClassDeclaration|ClassExpression': ClassDeclaration(context),
    'ClassProperty|ClassPrivateProperty': ClassProperty(context),
    'ClassMethod|ClassPrivateMethod|TSDeclareMethod': ClassMethod(context),
    'ObjectExpression': ObjectExpression(context),
    'TSPropertySignature': TSPropertySignature(context),
    'TSCallSignatureDeclaration': TSCallSignatureDeclaration(context),
    'TSConstructSignatureDeclaration': TSConstructSignatureDeclaration(context),
    // 'TSMethodSignature': TSMethodSignature(context),
    'TSIndexSignature': TSIndexSignature(context),
    'TSModuleDeclaration': TSModuleDeclaration(context),
    'TSTypeAliasDeclaration': TSTypeAliasDeclaration(context),
    'TSEnumDeclaration': TSEnumDeclaration(context),
    'TSEnumMember': TSEnumMember(context),
    'TSInterfaceDeclaration': TSInterfaceDeclaration(context),
    'TSTypeParameterDeclaration': TSTypeParameterDeclaration(context),

    'ImportDeclaration': ImportDeclaration(context),
    'ExportNamedDeclaration': ExportNamedDeclaration(context),
    'ExportDefaultDeclaration': ExportDefaultDeclaration(context),
    'AssignmentExpression': AssignmentExpression(context),
    'UpdateExpression': UpdateExpression(context),
  };
};
