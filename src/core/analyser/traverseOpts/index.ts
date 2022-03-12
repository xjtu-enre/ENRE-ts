import VariableDeclaration from './VariableDeclaration';
import {ENREEntityCollectionScoping} from '../entities';

export default (scopeProvider: Array<ENREEntityCollectionScoping>) => {
  return {
    'VariableDeclaration': VariableDeclaration(scopeProvider)
  };
}
