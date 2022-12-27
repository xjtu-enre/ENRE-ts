import {NodePath} from '@babel/traverse';
import {TSCallSignatureDeclaration} from '@babel/types';
import {ENREEntityCollectionInFile, recordEntityProperty} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName, ENRENameAnonymous} from '@enre/naming';
import {ENREContext} from '../context';
import {lastOf} from '../context/scope';

export default ({scope}: ENREContext) => {
  return (path: NodePath<TSCallSignatureDeclaration>) => {
    const entity = recordEntityProperty(
      buildENREName<ENRENameAnonymous>({as: 'CallableSignature'}),
      toENRELocation(path.node.loc),
      lastOf(scope),
    );

    verbose('Record Entity Property: ' + entity.name.printableName);

    (lastOf(scope).children as ENREEntityCollectionInFile[]).push(entity);
  };
};
