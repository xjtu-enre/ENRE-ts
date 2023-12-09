import {NodePath} from '@babel/traverse';
import {TSDeclareMethod} from '@babel/types';
import {ENREEntityCollectionAnyChildren, recordEntityMethod} from '@enre-ts/data';
import {toENRELocation} from '@enre-ts/location';
import ENREName from '@enre-ts/naming';
import {ENREContext} from '../context';

type PathType = NodePath<TSDeclareMethod>

export default (path: PathType, {scope}: ENREContext) => {
  // TODO: isXXX is determined by declare method's return type, not by parser. (Parser reports FP)

  if (path.node.key.type === 'Identifier') {
    const entity = recordEntityMethod(
      new ENREName('Norm', path.node.key.name),
      toENRELocation(path.node.key.loc),
      scope.last(),
      {
        kind: 'method',
        isStatic: path.node.static,
        isPrivate: false,
        isAsync: path.node.async,
        isGenerator: path.node.generator,
        isAbstract: path.node.abstract ?? false,
      },
    );

    scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);
  }
  // TODO: extract parameters
};
