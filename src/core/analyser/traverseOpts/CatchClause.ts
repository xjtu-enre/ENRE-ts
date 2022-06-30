/**
 * CatchClause
 *
 * Extractable entity:
 *   * Parameter
 */

import {ENREEntityCollectionScoping, ENRELocation} from '../entities';
import {NodePath} from '@babel/traverse';
import {CatchClause} from '@babel/types';
import {verbose} from '../../utils/cliRender';
import {buildENREName} from '../../utils/nameHelper';
import {ENREEntityParameter, recordEntityParameter} from '../entities/eParameter';
import handleBindingPatternRecursively from './common/handleBindingPatternRecursively';

const onRecord = (name: string, location: ENRELocation, scope: Array<ENREEntityCollectionScoping>) => {
  const entity = recordEntityParameter(
    buildENREName(name),
    location,
    scope[scope.length - 1],
  );

  scope.at(-1)!.children.add(entity);

  return entity;
};

const onLog = (entity: ENREEntityParameter) => {
  verbose('Record Entity Parameter (catch): ' + entity.name.printableName);
};

export default (scope: Array<ENREEntityCollectionScoping>) => {
  return {
    enter: (path: NodePath<CatchClause>) => {
      // TODO: Add a catch clause middle entity to represent the catch scope
      if (path.node.param) {
        handleBindingPatternRecursively<ENREEntityParameter>(
          path.node.param,
          scope,
          onRecord,
          onLog,
        );
      }
    },

    exit: () => {
      // scope.pop();
    }
  };
};
