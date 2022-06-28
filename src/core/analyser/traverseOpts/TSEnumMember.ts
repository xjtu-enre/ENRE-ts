/**
 * TSEnumMember
 *
 * Extractable entity:
 *   * Enum member
 */

import {ENREEntityCollectionScoping} from '../entities';
import {NodePath} from '@babel/traverse';
import {SourceLocation, TSEnumMember} from '@babel/types';
import {recordEntityEnumMember} from '../entities/eEnumMember';
import {buildENREName, ENRENameModified} from '../../utils/nameHelper';
import {toENRELocation} from '../../utils/locationHelper';
import {ENREEntityEnum} from '../entities/eEnum';
import {warn} from '../../utils/cliRender';

export default (scope: Array<ENREEntityCollectionScoping>) => {
  return (path: NodePath<TSEnumMember>) => {
    let entity;

    switch (path.node.id.type) {
      case 'Identifier':
        entity = recordEntityEnumMember(
          buildENREName(path.node.id.name),
          toENRELocation(path.node.id.loc as SourceLocation),
          scope[scope.length - 1] as ENREEntityEnum,
          /* TODO: Enum member value evaluation */
        );
        break;
      case 'StringLiteral':
        if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(path.node.id.value)) {
          // Base 10 standard numeric string as enum member name is invalid
          warn('Base10 standard numeric string literal can not be used as enum member name, this entity will be ignored.');
        } else {
          entity = recordEntityEnumMember(
            buildENREName<ENRENameModified>({
              raw: path.node.id.value,
              as: 'StringLiteral',
            }),
            toENRELocation(path.node.id.loc as SourceLocation),
            scope[scope.length - 1] as ENREEntityEnum,
          );
        }
        break;
    }
  };
};
