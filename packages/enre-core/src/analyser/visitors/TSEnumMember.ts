/**
 * TSEnumMember
 *
 * Extracted entities:
 *   * Enum Member
 */

import {NodePath} from '@babel/traverse';
import {TSEnumMember} from '@babel/types';
import {ENREEntityCollectionInFile, ENREEntityEnumMember, recordEntityEnumMember} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {verbose, warn} from '@enre/logging';
import {buildENREName, ENRENameModified} from '@enre/naming';
import {ENREContext} from '../context';
import {lastOf} from '../context/scope';

export default ({scope}: ENREContext) => {
  return (path: NodePath<TSEnumMember>) => {
    let entity: ENREEntityEnumMember | undefined = undefined;

    switch (path.node.id.type) {
      case 'Identifier':
        entity = recordEntityEnumMember(
          buildENREName(path.node.id.name),
          toENRELocation(path.node.id.loc),
          lastOf(scope),
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
            toENRELocation(path.node.id.loc),
            lastOf(scope),
          );
        }
        break;
    }

    if (entity) {
      verbose('Record Entity Enum Member: ' + entity.name.printableName);
      (lastOf(scope).children as ENREEntityCollectionInFile[]).push(entity);
    }
  };
};
