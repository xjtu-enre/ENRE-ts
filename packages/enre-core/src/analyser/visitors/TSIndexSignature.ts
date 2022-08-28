import {NodePath} from '@babel/traverse';
import {SourceLocation, TSIndexSignature, TSTypeAnnotation} from '@babel/types';
import {ENREEntityCollectionInFile, ENREEntityProperty, recordEntityProperty} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName, ENRENameAnonymous} from '@enre/naming';
import {ENREContext} from '../context';

export default ({scope}: ENREContext) => {
  return (path: NodePath<TSIndexSignature>) => {
    let entity: ENREEntityProperty | undefined = undefined;

    const type = (path.node.parameters[0].typeAnnotation as TSTypeAnnotation).typeAnnotation.type;
    if (type === 'TSNumberKeyword') {
      entity = recordEntityProperty(
        buildENREName<ENRENameAnonymous>({as: 'NumberIndexSignature'}),
        toENRELocation(path.node.loc as SourceLocation),
        scope.last(),
      );
    } else if (type === 'TSStringKeyword') {
      entity = recordEntityProperty(
        buildENREName<ENRENameAnonymous>({as: 'StringIndexSignature'}),
        toENRELocation(path.node.loc as SourceLocation),
        scope.last(),
      );
    } else {
      // TODO: Warning
    }

    if (entity) {
      verbose('Record Entity Property: ' + entity.name.printableName);
      (scope.last().children as ENREEntityCollectionInFile[]).push(entity);
    }
  };
};
