/**
 * TSExportAssignment
 *
 * Extracted relations:
 *   * Export
 */

import {NodePath} from '@babel/traverse';
import {TSExportAssignment} from '@babel/types';
import {ENRERelationExport, pseudoR} from '@enre-ts/data';
import {ENREContext} from '../context';
import {toENRELocation} from '@enre-ts/location';

type PathType = NodePath<TSExportAssignment>

export default (path: PathType, {scope}: ENREContext) => {
  if (path.node.expression.type === 'Identifier') {
    pseudoR.add<ENRERelationExport>({
      type: 'export',
      from: scope.last(),
      to: {
        role: 'any',
        identifier: path.node.expression.name,
        at: scope.last(),
      },
      location: toENRELocation(path.node.expression.loc),
      isDefault: false,
      isAll: false,
      kind: 'any',
    });
  }
};
