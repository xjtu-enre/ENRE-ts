/**
 * VariableDeclaration
 *
 * Extracted entities:
 *   * Variable
 *
 * Extracted relations:
 *   * Set @init=true
 */

import {NodePath} from '@babel/traverse';
import {PatternLike, VariableDeclaration} from '@babel/types';
import {
  ENREEntityCollectionInFile,
  ENREEntityVariable,
  ENREEntityVariableKind,
  recordEntityVariable,
  recordRelationSet
} from '@enre/container';
import {ENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName} from '@enre/naming';
import {ENREContext} from '../context';
import {CommandLifeCycleKind, CommandType} from '../context/commandStack';
import handleBindingPatternRecursively from './common/handleBindingPatternRecursively';

const buildOnRecord = (kind: ENREEntityVariableKind, hasInit: boolean) => {
  return (name: string, location: ENRELocation, scope: ENREContext['scope']) => {
    const entity = recordEntityVariable(
      buildENREName(name),
      location,
      scope.last(),
      kind
    );

    (scope.last().children as ENREEntityCollectionInFile[]).push(entity);

    if (hasInit) {
      // Record relation `set`
      recordRelationSet(
        scope.last(),
        entity,
        location,
        true,
      );
    }

    return entity;
  };
};

const onLog = (entity: ENREEntityVariable) => {
  verbose('Record Entity Variable: ' + entity.name.printableName);
};

export default ({scope, cs}: ENREContext) => {
  return {
    enter: (path: NodePath<VariableDeclaration>) => {
      const kind = path.node.kind;
      for (const declarator of path.node.declarations) {
        const hasInit = !!declarator.init;

        handleBindingPatternRecursively<ENREEntityVariable>(
          declarator.id as PatternLike,
          scope,
          buildOnRecord(kind, hasInit),
          onLog,
        );
      }
    },

    exit: () => {
      /**
       * This removes the long-term `export` command that exports
       * all variable declarations within the export declaration.
       */
      const top = cs.at(-1);
      if (top && top.cmd === CommandType.export && top.lifeCycle === CommandLifeCycleKind.onCondition) {
        cs.pop();
      }
    }
  };
};
