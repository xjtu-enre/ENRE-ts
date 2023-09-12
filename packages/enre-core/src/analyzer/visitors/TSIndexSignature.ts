import {NodePath} from '@babel/traverse';
import {TSIndexSignature, TSTypeAnnotation} from '@babel/types';
import {ENREEntityCollectionAnyChildren, ENREEntityProperty, id, recordEntityProperty} from '@enre/data';
import {toENRELocation} from '@enre/location';
import {ENREContext} from '../context';
import ENREName from '@enre/naming';

type PathType = NodePath<TSIndexSignature>

export default (path: PathType, {scope}: ENREContext) => {
  let entity: id<ENREEntityProperty> | undefined = undefined;

  const type = (path.node.parameters[0].typeAnnotation as TSTypeAnnotation).typeAnnotation.type;
  if (type === 'TSNumberKeyword') {
    entity = recordEntityProperty(
      new ENREName('Sig', 'NumberIndex'),
      toENRELocation(path.node.loc),
      scope.last(),
    );
  } else if (type === 'TSStringKeyword') {
    entity = recordEntityProperty(
      new ENREName('Sig', 'StringIndex'),
      toENRELocation(path.node.loc),
      scope.last(),
    );
  } else {
    // TODO: Warning
  }

  if (entity) {
    scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);
  }
};
