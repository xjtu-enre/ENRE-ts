import {ENREContext} from '../context';

export default ({scope}: ENREContext) => {
  // return (path: NodePath<TSCallSignatureDeclaration>) => {
  //   const entity = recordEntityProperty(
  //     buildENREName<ENRENameAnonymous>({as: 'CallableSignature'}),
  //     toENRELocation(path.node.loc as SourceLocation),
  //     scope.last(),
  //   );
  //
  //   verbose('Record Entity Property: ' + entity.name.printableName);
  //
  //   (scope.last().children as ENREEntityCollectionInFile[]).push(entity);
  // };
};
