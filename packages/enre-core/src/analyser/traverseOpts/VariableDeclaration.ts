/**
 * VariableDeclaration
 *
 * Extractable entity:
 *   * Variable
 */

import {NodePath} from '@babel/traverse';
import {PatternLike, VariableDeclaration} from '@babel/types';
import {verbose} from '@enre/logging';
import {ENREEntityCollectionScoping} from '../entities';
import {ENREEntityVariable, ENREEntityVariableKind, recordEntityVariable} from '../entities/eVariable';
import {buildENREName} from '@enre/naming';
import {ENRELocation} from '@enre/location';
import handleBindingPatternRecursively from './common/handleBindingPatternRecursively';

const buildOnRecord = (kind: ENREEntityVariableKind) => {
  return (name: string, location: ENRELocation, scope: Array<ENREEntityCollectionScoping>) => {
    return recordEntityVariable(
      buildENREName(name),
      location,
      scope[scope.length - 1],
      kind
    );
  };
};

const onLog = (entity: ENREEntityVariable) => {
  verbose('Record Entity Variable: ' + entity.name.printableName);
};

export default (scope: Array<ENREEntityCollectionScoping>) => {
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
