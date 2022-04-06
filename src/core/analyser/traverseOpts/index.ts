import VariableDeclaration from './VariableDeclaration';
import {ENREEntityCollectionScoping} from '../entities';
import FunctionDeclaration from './FunctionDeclaration';
import ArrowFunctionExpression from './ArrowFunctionExpression';
import CatchClause from './CatchClause';
import ClassDeclaration from './ClassDeclaration';
import ClassProperty from './ClassProperty';

export default (scopeProvider: Array<ENREEntityCollectionScoping>) => {
  return {
    'VariableDeclaration': VariableDeclaration(scopeProvider),
    'FunctionDeclaration|FunctionExpression': FunctionDeclaration(scopeProvider),
    'ArrowFunctionExpression': ArrowFunctionExpression(scopeProvider),
    'CatchClause': CatchClause(scopeProvider),
    'ClassDeclaration|ClassExpression': ClassDeclaration(scopeProvider),
    'ClassProperty|ClassPrivateProperty': ClassProperty(scopeProvider),
  };
};
