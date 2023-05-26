import {NodePath} from '@babel/traverse';
import {TSConstructSignatureDeclaration} from '@babel/types';
import {recordEntityProperty} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName, ENRENameAnonymous} from '@enre/naming';
import {ENREContext} from '../context';
import {ENREEntityCollectionAnyChildren} from '@enre/container/lib/entity/collections';

type PathType = NodePath<TSConstructSignatureDeclaration>

export default (path: PathType, {scope}: ENREContext) => {
  const entity = recordEntityProperty(
    buildENREName<ENRENameAnonymous>({as: 'CallableSignature'}),
    toENRELocation(path.node.loc),
    scope.last(),
  );

  verbose('Record Entity Property: ' + entity.name.printableName);

  scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);
};
