import {ENREEntityCollectionScoping} from '../entities';
import VariableDeclaration from './VariableDeclaration';
import FunctionDeclaration from './FunctionDeclaration';
import ArrowFunctionExpression from './ArrowFunctionExpression';
import CatchClause from './CatchClause';
import ClassDeclaration from './ClassDeclaration';
import ClassProperty from './ClassProperty';
import ClassMethod from './ClassMethod';

export default (scopeProvider: Array<ENREEntityCollectionScoping>) => {
  return {
    'VariableDeclaration': VariableDeclaration(scopeProvider),
    'FunctionDeclaration|FunctionExpression': FunctionDeclaration(scopeProvider),
    'ArrowFunctionExpression': ArrowFunctionExpression(scopeProvider),
    'CatchClause': CatchClause(scopeProvider),
    'ClassDeclaration|ClassExpression': ClassDeclaration(scopeProvider),
    'ClassProperty|ClassPrivateProperty': ClassProperty(scopeProvider),
    'ClassMethod|ClassPrivateMethod': ClassMethod(scopeProvider),
  };
};
