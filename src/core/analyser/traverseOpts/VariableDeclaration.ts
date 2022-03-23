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
import {buildENRECodeName, ENRENameBuildOption} from '../../utils/nameHelper';
import handleBindingPatternRecursively from './common/handleBindingPatternRecursively';

const buildOnRecord = (kind: ENREEntityVariableKind) => {
  return (name: string, location: ENRELocation, scope: Array<ENREEntityCollectionScoping>) => {
    return recordEntityVariable(
      buildENRECodeName(ENRENameBuildOption.value, name),
      location,
      scope[scope.length - 1],
      kind
    );
  };
};

const onLog = (entity: ENREEntityVariable) => {
  verbose('Record Entity Variable: ' + entity.name);
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
