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
import {
  ENREEntityCollectionAnyChildren,
  ENREEntityMethod,
  ENRELogEntry,
  ENRERelationExtend,
  pseudoR,
  recordEntityTypeParameter,
} from '@enre-ts/data';
import {toENRELocation} from '@enre-ts/location';
import ENREName from '@enre-ts/naming';
import {ENREContext} from '../context';

type PathType = NodePath<TSTypeParameterDeclaration>

export default (path: PathType, {file: {logs}, scope}: ENREContext) => {
  if (path.node.params.length === 0) {
    logs.add(path.node.loc!.start.line, ENRELogEntry['Type parameter list cannot be empty']);
    return;
  }

  if (scope.last().type === 'method' && ['get', 'set'].includes(scope.last<ENREEntityMethod>().kind)) {
    logs.add(path.node.loc!.start.line, ENRELogEntry['An accessor cannot have type parameters']);
    return;
  }

  for (const tp of path.node.params) {
    if (tp.const && ['TSInterfaceDeclaration', 'TSTypeAliasDeclaration'].indexOf(path.parent.type) !== -1) {
      logs.add(path.node.loc!.start.line, ENRELogEntry['const modifier can only appear on a type parameter of a function, method or class']);
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
      new ENREName('Norm', tp.name),
      toENRELocation({
        start: {
          line: tp.loc!.start.line,
          column: startColumn
        }
      } as SourceLocation),
      scope.last(),
      {
        isConst: tp.const ?? false,
      }
    );

    scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);

    if (tp.constraint) {
      if (tp.constraint.type === 'TSTypeReference') {
        if (tp.constraint.typeName.type === 'Identifier') {
          pseudoR.add<ENRERelationExtend>({
            type: 'extend',
            from: entity,
            to: {role: 'type', identifier: tp.constraint.typeName.name, at: scope.last()},
            location: toENRELocation(tp.constraint.typeName.loc),
          });
        }
      }
    }
  }
};
