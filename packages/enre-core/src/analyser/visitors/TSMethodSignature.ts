import {ENREContext} from '../context';
import {NodePath} from '@babel/traverse';
import {TSCallSignatureDeclaration} from '@babel/types';

type PathType = NodePath<TSCallSignatureDeclaration>

export default (path: PathType, {scope}: ENREContext) => {
  // const entity = recordEntityProperty(
  //   buildENREName<ENRENameAnonymous>({as: 'CallableSignature'}),
  //   toENRELocation(path.node.loc),
  //   scope.last(),
  // );
  //
  // verbose('Record Entity Property: ' + entity.name.printableName);
  //
  // scope.last().children.push(entity);
};
