import {NodePath} from '@babel/traverse';
import {TSCallSignatureDeclaration} from '@babel/types';
import {ENREEntityCollectionAnyChildren, recordEntityProperty} from '@enre-ts/data';
import {toENRELocation} from '@enre-ts/location';
import ENREName from '@enre-ts/naming';
import {ENREContext} from '../context';

type PathType = NodePath<TSCallSignatureDeclaration>

export default (path: PathType, {scope}: ENREContext) => {
  const entity = recordEntityProperty(
    new ENREName<'Sig'>('Sig', 'Callable'),
    toENRELocation(path.node.loc),
    scope.last(),
  );

  scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);
};

