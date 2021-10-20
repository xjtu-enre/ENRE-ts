import VariableDeclaration from './VariableDeclaration';
import {ENREEntityScopeMaking} from '../entities';

export default (scopeProvider: Array<ENREEntityScopeMaking>) => {
  return {
    'VariableDeclaration': VariableDeclaration(scopeProvider)
  };
}
