import {ENREContext} from '../context';
import {NodePath} from '@babel/traverse';
import {TSCallSignatureDeclaration} from '@babel/types';

type PathType = NodePath<TSCallSignatureDeclaration>

export default (path: PathType, {scope}: ENREContext) => {
  // const entity = recordEntityProperty(
  //   new ENREName<'Sig'>('Sig', 'Callable'),
  //   toENRELocation(path.node.loc),
  //   scope.last(),
  // );
  //
  // scope.last().children.push(entity);
};
