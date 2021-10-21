import {NodePath} from '@babel/traverse';
import {
  Identifier,
  PatternLike,
  RestElement,
  SourceLocation,
  VariableDeclaration
} from '@babel/types';
import {debug, verbose} from '../../utils/cliRender';
import {ENREEntityScopeMaking} from '../entities';
import {ENREEntityVariable, recordEntityVariable, variableKind} from '../entities/eVariable';
import {toENRECodeLocation} from '../../utils/codeLocHelper';

const handleBindingPatternRecursively = (
  id: PatternLike,
  scope: Array<ENREEntityScopeMaking>,
  kind: variableKind
) => {
  const buildHelper = (name: string, location: SourceLocation): ENREEntityVariable => {
    return recordEntityVariable(
      name,
      location,
      scope[scope.length - 1],
      kind
    );
  };

  let entity;

  switch (id.type) {
  case 'Identifier':
    entity = buildHelper(
      id.name,
      toENRECodeLocation(id.loc)
    );
    verbose('VariableDeclaration: ' + entity.name);
    break;

  case 'RestElement':
    entity = buildHelper(
      (id.argument as Identifier).name,
      toENRECodeLocation(id.argument.loc)
    );
    verbose('VariableDeclaration: ' + entity.name);
    break;

  case 'AssignmentPattern':
    handleBindingPatternRecursively(
      id.left as PatternLike,
      scope,
      kind
    );
    break;

  case 'ObjectPattern':
    for (const property of id.properties) {
      if (property.type === 'RestElement') {
        // It's argument can only be Identifier
        handleBindingPatternRecursively(
          property.argument as RestElement,
          scope,
          kind
        );
      } else {
        // property.type === 'ObjectProperty'
        handleBindingPatternRecursively(
          property.value as PatternLike,
          scope,
          kind
        );
      }
    }
    break;

  case 'ArrayPattern':
    for (const element of id.elements) {
      if (element === null) {
        continue;
      }

      if (element.type === 'RestElement') {
        handleBindingPatternRecursively(
          element.argument as RestElement,
          scope,
          kind
        );
      } else {
        // element.type === 'PatternLike'
        handleBindingPatternRecursively(
          element as PatternLike,
          scope,
          kind
        );
      }
    }
    break;
  }
};

export default (scope: Array<ENREEntityScopeMaking>) => {
  return (path: NodePath<VariableDeclaration>) => {
    const kind = path.node.kind;
    for (const declarator of path.node.declarations) {
      handleBindingPatternRecursively(declarator.id as PatternLike, scope, kind);
    }
  };
};
