import VariableDeclaration from './VariableDeclaration';
import {ENREEntityCollectionScoping} from '../entities';
import FunctionDeclaration from './FunctionDeclaration';

export default (scopeProvider: Array<ENREEntityCollectionScoping>) => {
  return {
    'VariableDeclaration': VariableDeclaration(scopeProvider),
    'FunctionDeclaration': FunctionDeclaration(scopeProvider),
  };
}
