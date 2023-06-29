import {NodePath} from '@babel/traverse';
import {TSCallSignatureDeclaration} from '@babel/types';
import {ENREEntityCollectionAnyChildren, recordEntityProperty} from '@enre/data';
import {toENRELocation} from '@enre/location';
import ENREName from '@enre/naming';
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

