/**
 * VariableDeclaration
 *
 * Extractable entity:
 *   * Variable
 */

import {NodePath} from '@babel/traverse';
import {PatternLike, VariableDeclaration} from '@babel/types';
import {verbose} from '../../utils/cliRender';
import {ENREEntityCollectionScoping, ENRELocation} from '../entities';
import {ENREEntityVariable, ENREEntityVariableKind, recordEntityVariable} from '../entities/eVariable';
import {buildENREName} from '../../utils/nameHelper';
import handleBindingPatternRecursively from './common/handleBindingPatternRecursively';

const buildOnRecord = (kind: ENREEntityVariableKind) => {
  return (name: string, location: ENRELocation, scope: Array<ENREEntityCollectionScoping>) => {
    const entity = recordEntityVariable(
      buildENREName(name),
      location,
      scope[scope.length - 1],
      kind
    );

    scope.at(-1)!.children.add(entity);

    return entity;
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
