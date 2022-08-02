import {ENREContext} from '../context';
import ArrowFunctionExpression from './ArrowFunctionExpression';
import CatchClause from './CatchClause';
import ClassDeclaration from './ClassDeclaration';
import ClassMethod from './ClassMethod';
import ClassProperty from './ClassProperty';
import FunctionDeclaration from './FunctionDeclaration';
import TSEnumDeclaration from './TSEnumDeclaration';
import TSEnumMember from './TSEnumMember';
import TSInterfaceDeclaration from './TSInterfaceDeclaration';
import TSTypeAliasDeclaration from './TSTypeAliasDeclaration';
import TSTypeParameterDeclaration from './TSTypeParameterDeclaration';
import VariableDeclaration from './VariableDeclaration';

export default (context: ENREContext) => {
  return {
    'VariableDeclaration': VariableDeclaration(context),
    'FunctionDeclaration|FunctionExpression': FunctionDeclaration(context),
    'ArrowFunctionExpression': ArrowFunctionExpression(context),
    'CatchClause': CatchClause(context),
    'ClassDeclaration|ClassExpression': ClassDeclaration(context),
    'ClassProperty|ClassPrivateProperty': ClassProperty(context),
    'ClassMethod|ClassPrivateMethod|TSDeclareMethod': ClassMethod(context),
    'TSTypeAliasDeclaration': TSTypeAliasDeclaration(context),
    'TSEnumDeclaration': TSEnumDeclaration(context),
    'TSEnumMember': TSEnumMember(context),
    'TSInterfaceDeclaration': TSInterfaceDeclaration(context),
    'TSTypeParameterDeclaration': TSTypeParameterDeclaration(context),
  };
};
