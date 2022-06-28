/**
 * TSEnumDeclaration
 *
 * Extractable entity:
 *   * Enum
 */

import {ENREEntityCollectionScoping} from '../entities';
import {NodePath} from '@babel/traverse';
import {SourceLocation, TSEnumDeclaration} from '@babel/types';
import {recordEntityEnum} from '../entities/eEnum';
import {buildENREName} from '../../utils/nameHelper';
import {toENRELocation} from '../../utils/locationHelper';
import {verbose} from '../../utils/cliRender';

export default (scope: Array<ENREEntityCollectionScoping>) => {
  return {
    enter: (path: NodePath<TSEnumDeclaration>) => {
      const entity = recordEntityEnum(
        buildENREName(path.node.id.name),
        toENRELocation(path.node.id.loc as SourceLocation),
        scope[scope.length - 1],
        path.node.const as boolean,
      );
      verbose('Record Entity Enum: ' + entity.name.printableName);

      scope.push(entity);
    },

    exit: () => {
      scope.pop();
    }
  };
};
