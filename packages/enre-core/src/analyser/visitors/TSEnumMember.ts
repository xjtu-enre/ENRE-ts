/**
 * TSEnumMember
 *
 * Extracted entities:
 *   * Enum Member
 */

import {NodePath} from '@babel/traverse';
import {SourceLocation, TSEnumMember} from '@babel/types';
import {
  ENREEntityCollectionScoping,
  ENREEntityEnum,
  ENREEntityEnumMember,
  recordEntityEnumMember
} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {warn} from '@enre/logging';
import {buildENREName, ENRENameModified} from '@enre/naming';

export default (scope: Array<ENREEntityCollectionScoping>) => {
  return (path: NodePath<TSEnumMember>) => {
    let entity: ENREEntityEnumMember;

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

    /**
     * Entity will not be undefined for sure, since there are only 2 cases,
     * which are all been switched
     */
    scope.at(-1)!.children.add(entity!);
  };
};
