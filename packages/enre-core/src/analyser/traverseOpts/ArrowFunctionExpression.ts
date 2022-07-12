/**
 * ArrowFunctionDeclaration
 *
 * Extractable entity:
 *   * Function
 *     + (Only) Arrow Function
 *   * Parameter
 */

import {ENREEntityCollectionScoping} from '../entities';
import {NodePath} from '@babel/traverse';
import {ArrowFunctionExpression, SourceLocation} from '@babel/types';
import {recordEntityFunction} from '../entities/eFunction';
import {ENRELocation, toENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName, ENRENameAnonymous} from '@enre/naming';
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
  verbose('Record Entity Parameter: ' + entity.name.printableName);
};

export default (scope: Array<ENREEntityCollectionScoping>) => {
  return {
    enter: (path: NodePath<ArrowFunctionExpression>) => {
      const entity = recordEntityFunction(
        buildENREName<ENRENameAnonymous>({as: 'ArrowFunction'}),
        toENRELocation(path.node.loc as SourceLocation),
        scope[scope.length - 1],
        true,
        path.node.async,
        path.node.generator,
      );
      verbose('Record Entity Function (arrow): ' + entity.name.printableName);

      scope.push(entity);

      for (const param of path.node.params) {
        handleBindingPatternRecursively<ENREEntityParameter>(
          param,
          scope,
          onRecord,
          onLog,
        );
      }
    },

    exit: () => {
      scope.pop();
    }
  };
};
