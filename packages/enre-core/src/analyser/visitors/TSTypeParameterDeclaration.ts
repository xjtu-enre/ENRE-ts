/**
 * TSTypeParameterDeclaration
 *
 * Extracted entities:
 *   * Type Parameter
 *
 * Extracted relations:
 *   * Extend
 */
import {NodePath} from '@babel/traverse';
import {SourceLocation, TSTypeParameterDeclaration} from '@babel/types';
import {ENREEntityCollectionInFile, ENREEntityMethod, recordEntityTypeParameter} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {error, verbose} from '@enre/logging';
import {buildENREName} from '@enre/naming';
import {ENREContext} from '../context';

export default ({scope}: ENREContext) => {
  return (path: NodePath<TSTypeParameterDeclaration>) => {
    if (path.node.params.length === 0) {
      error('TSError: Type parameter list cannot be empty.');
      return;
    }

    if (scope.last().type === 'method' && ['get', 'set'].includes(scope.last<ENREEntityMethod>().kind)) {
      error('TSError: An accessor cannot have type parameters.');
      return;
    }

    for (const tp of path.node.params) {
      const entity = recordEntityTypeParameter(
        buildENREName(tp.name),
        toENRELocation(tp.loc as SourceLocation),
        scope.last(),
      );

      verbose('Record Entity Type Parameter: ' + entity.name.printableName);

      (scope.last().children as ENREEntityCollectionInFile[]).push(entity);
    }
  };
};
