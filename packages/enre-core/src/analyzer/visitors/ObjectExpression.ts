/**
 * ObjectExpression
 *
 * Extracted entities:
 *   * Property
 */

import {ENREContext} from '../context';
import {NodePath} from '@babel/traverse';
import {ObjectExpression, SourceLocation} from '@babel/types';
import {ModifierType} from '../context/modifier-stack';
import {ENREEntityCollectionInFile, ENREEntityProperty, recordEntityProperty} from '@enre/data';
import {toENRELocation} from '@enre/location';
import ENREName from '@enre/naming';

type PathType = NodePath<ObjectExpression>

export default (path: PathType, {scope, modifier}: ENREContext) => {
  const topCommand = modifier.at(-1);
  if (!(topCommand && topCommand.type === ModifierType.acceptProperty)) {
    /**
     * Those conditions make this function only record `Entity: Property`
     * exclusively in an ObjectExpression as VariableDeclaration's init,
     * but not other places (such as object literals as function's parameter).
     */
    return;
  }

  for (const objectProperty of path.node.properties) {
    if (objectProperty.type === 'SpreadElement') {
      // TODO?: SpreadElement inference
      continue;
    }

    let entity: ENREEntityProperty | undefined;

    const keyType = objectProperty.key.type;
    switch (keyType) {
      case 'Identifier':
        recordEntityProperty(
          new ENREName('Norm', objectProperty.key.name),
          toENRELocation(objectProperty.key.loc),
          scope.last(),
        );
        break;

      case 'StringLiteral':
        recordEntityProperty(
          new ENREName('Str', objectProperty.key.value),
          toENRELocation(objectProperty.key.loc as SourceLocation),
          scope.last(),
        );
        break;

      case 'NumericLiteral':
        recordEntityProperty(
          new ENREName('Num', objectProperty.key.extra?.raw as string, objectProperty.key.value),
          toENRELocation(objectProperty.key.loc as SourceLocation),
          scope.last(),
        );
        break;

      default:
    }

    if (entity) {
      (scope.last().children as ENREEntityCollectionInFile[]).push(entity);
    }
  }
};
