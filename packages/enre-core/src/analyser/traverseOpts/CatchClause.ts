/**
 * CatchClause
 *
 * Extractable entity:
 *   * Parameter
 */

import {ENREEntityCollectionScoping} from '../entities';
import {NodePath} from '@babel/traverse';
import {CatchClause} from '@babel/types';
import {verbose} from '@enre/logging';
import {buildENREName} from '@enre/naming';
import {ENRELocation} from '@enre/location';
import {ENREEntityParameter, recordEntityParameter} from '../entities/eParameter';
import handleBindingPatternRecursively from './common/handleBindingPatternRecursively';

const onRecord = (name: string, location: ENRELocation, scope: Array<ENREEntityCollectionScoping>) => {
  return recordEntityParameter(
    buildENREName(name),
    location,
    scope[scope.length - 1],
  );
};

const onLog = (entity: ENREEntityParameter) => {
  verbose('Record Entity Parameter (catch): ' + entity.name.printableName);
};

export default (scope: Array<ENREEntityCollectionScoping>) => {
  return {
    enter: (path: NodePath<CatchClause>) => {
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
