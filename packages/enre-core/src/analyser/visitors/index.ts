import {ENREEntityCollectionScoping} from '@enre/container';
import ArrowFunctionExpression from './ArrowFunctionExpression';
import CatchClause from './CatchClause';
import ClassDeclaration from './ClassDeclaration';
import ClassMethod from './ClassMethod';
import ClassProperty from './ClassProperty';
import FunctionDeclaration from './FunctionDeclaration';
import TSEnumDeclaration from './TSEnumDeclaration';
import TSEnumMember from './TSEnumMember';
import VariableDeclaration from './VariableDeclaration';

export default (scopeProvider: Array<ENREEntityCollectionScoping>) => {
  return {
    'VariableDeclaration': VariableDeclaration(scopeProvider),
    'FunctionDeclaration|FunctionExpression': FunctionDeclaration(scopeProvider),
    'ArrowFunctionExpression': ArrowFunctionExpression(scopeProvider),
    'CatchClause': CatchClause(scopeProvider),
    'ClassDeclaration|ClassExpression': ClassDeclaration(scopeProvider),
    'ClassProperty|ClassPrivateProperty': ClassProperty(scopeProvider),
    'ClassMethod|ClassPrivateMethod': ClassMethod(scopeProvider),
    'TSEnumDeclaration': TSEnumDeclaration(scopeProvider),
    'TSEnumMember': TSEnumMember(scopeProvider),
  };
};
