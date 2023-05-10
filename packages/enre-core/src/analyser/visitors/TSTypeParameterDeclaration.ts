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
import {ENREEntityCollectionInFile, ENREEntityMethod, pseudoR, recordEntityTypeParameter} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {error, verbose} from '@enre/logging';
import {buildENREName} from '@enre/naming';
import {ENREContext} from '../context';
import {ENREi18nen_US} from '../../i18n/en_US/ts-compiling';
import {lastOf} from '../context/scope';

export default ({scope}: ENREContext) => {
  return (path: NodePath<TSTypeParameterDeclaration>) => {
    if (path.node.params.length === 0) {
      error(ENREi18nen_US['Type parameter list cannot be empty']);
      return;
    }

    if (lastOf(scope).type === 'method' && ['get', 'set'].includes(lastOf<ENREEntityMethod>(scope).kind)) {
      error(ENREi18nen_US['An accessor cannot have type parameters']);
      return;
    }

    for (const tp of path.node.params) {
      if (['TSInterfaceDeclaration', 'TSTypeAliasDeclaration'].indexOf(path.parent.type) !== -1) {
        error(ENREi18nen_US['const modifier can only appear on a type parameter of a function, method or class']);
        return;
      }

      /**
       * For `const T`, @babel/parser as of 7.21.8 does not provide the range of identifier `T`,
       * whereas the location contains the `const` keyword. A workaround is easy, but we should
       * propose an issue to babel.
       */
      let startColumn = tp.loc!.start.column;
      if (tp.const) {
        startColumn = tp.loc!.end.column - tp.name.length;
      }

      const entity = recordEntityTypeParameter(
        buildENREName(tp.name),
        toENRELocation({start: {line: tp.loc!.start.line, column: startColumn}} as SourceLocation),
        lastOf(scope),
        {
          isConst: tp.const ?? false,
        }
      );

      verbose('Record Entity Type Parameter: ' + entity.name.printableName);

      (lastOf(scope).children as ENREEntityCollectionInFile[]).push(entity);

      if (tp.constraint) {
        if (tp.constraint.type === 'TSTypeReference') {
          if (tp.constraint.typeName.type === 'Identifier') {
            pseudoR.add({
              type: 'extend',
              from: entity,
              to: {role: 'type', identifier: tp.constraint.typeName.name},
              location: toENRELocation(tp.constraint.typeName.loc),
              at: lastOf(scope),
            });
          }
        }
      }
    }
  };
};
