import VariableDeclaration from './VariableDeclaration';
import {ENREEntityCollectionScoping} from '../entities';
import FunctionDeclaration from './FunctionDeclaration';
import ArrowFunctionExpression from './ArrowFunctionExpression';

export default (scopeProvider: Array<ENREEntityCollectionScoping>) => {
  return {
    'VariableDeclaration': VariableDeclaration(scopeProvider),
    'FunctionDeclaration|FunctionExpression': FunctionDeclaration(scopeProvider),
    'ArrowFunctionExpression': ArrowFunctionExpression(scopeProvider),
  };
};
