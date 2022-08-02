/**
 * VariableDeclaration
 *
 * Extracted entities:
 *   * Variable
 */

import {NodePath} from '@babel/traverse';
import {PatternLike, VariableDeclaration} from '@babel/types';
import {
  ENREEntityCollectionInFile,
  ENREEntityVariable,
  ENREEntityVariableKind,
  recordEntityVariable
} from '@enre/container';
import {ENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName} from '@enre/naming';
import {ENREContext} from '../context';
import handleBindingPatternRecursively from './common/handleBindingPatternRecursively';

const buildOnRecord = (kind: ENREEntityVariableKind) => {
  return (name: string, location: ENRELocation, scope: ENREContext['scope']) => {
    const entity = recordEntityVariable(
      buildENREName(name),
      location,
      scope.last(),
      kind
    );

    (scope.last().children as ENREEntityCollectionInFile[]).push(entity);

    return entity;
  };
};

const onLog = (entity: ENREEntityVariable) => {
  verbose('Record Entity Variable: ' + entity.name.printableName);
};

export default ({scope}: ENREContext) => {
  return (path: NodePath<VariableDeclaration>) => {
    const kind = path.node.kind;
    for (const declarator of path.node.declarations) {
      handleBindingPatternRecursively<ENREEntityVariable>(
        declarator.id as PatternLike,
        scope,
        buildOnRecord(kind),
        onLog,
      );
    }
  };
};
