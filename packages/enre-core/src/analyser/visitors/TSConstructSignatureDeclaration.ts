import {NodePath} from '@babel/traverse';
import {SourceLocation, TSConstructSignatureDeclaration} from '@babel/types';
import {ENREEntityCollectionInFile, recordEntityProperty} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName, ENRENameAnonymous} from '@enre/naming';
import {ENREContext} from '../context';

export default ({scope}: ENREContext) => {
  return (path: NodePath<TSConstructSignatureDeclaration>) => {
    const entity = recordEntityProperty(
      buildENREName<ENRENameAnonymous>({as: 'CallableSignature'}),
      toENRELocation(path.node.loc as SourceLocation),
      scope.last(),
    );

    verbose('Record Entity Property: ' + entity.name.printableName);

    (scope.last().children as ENREEntityCollectionInFile[]).push(entity);
  };
};
