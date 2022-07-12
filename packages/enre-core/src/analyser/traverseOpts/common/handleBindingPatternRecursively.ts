import {Identifier, PatternLike, SourceLocation, TSParameterProperty} from '@babel/types';
import {ENREEntityCollectionScoping} from '../../entities';
import {ENREEntityVariable} from '../../entities/eVariable';
import {ENRELocation, toENRELocation} from '@enre/location';
import {ENREEntityParameter} from '../../entities/eParameter';
import {warn} from '@enre/logging';

const handleBindingPatternRecursively = <T extends ENREEntityVariable | ENREEntityParameter>(
  /**
   * Adding type `TSParameterProperty` for a simpler type annotation in `ClassMethod`,
   * more explicitly, class's constructor. TS has a syntax sugar for declaring class field
   * at the same time the constructor defines.
   *
   * See https://www.typescriptlang.org/docs/handbook/classes.html#parameter-properties.
   */
  id: PatternLike | TSParameterProperty,
  scope: Array<ENREEntityCollectionScoping>,
  onRecord: (
    name: string,
    location: ENRELocation,
    scope: Array<ENREEntityCollectionScoping>
  ) => T,
  onLog: (entity: T) => void,
) => {
  let entity;

  switch (id.type) {
    case 'Identifier':
      entity = onRecord(
        id.name,
        toENRELocation(id.loc as SourceLocation),
        scope,
      );
      onLog(entity);
      break;

    case 'RestElement':
      handleBindingPatternRecursively(
        id.argument as Identifier,
        scope,
        onRecord,
        onLog,
      );
      break;

    case 'AssignmentPattern':
      handleBindingPatternRecursively(
        id.left as PatternLike,
        scope,
        onRecord,
        onLog,
      );
      break;

    case 'ObjectPattern':
      for (const property of id.properties) {
        if (property.type === 'RestElement') {
          // Its argument can ONLY be Identifier
          handleBindingPatternRecursively(
            property.argument as Identifier,
            scope,
            onRecord,
            onLog,
          );
        } else {
          // property.type === 'ObjectProperty'
          handleBindingPatternRecursively(
            property.value as PatternLike,
            scope,
            onRecord,
            onLog,
          );
        }
      }
      break;

    case 'ArrayPattern':
      for (const element of id.elements) {
        if (element === null) {
          continue;
        }

        if (element.type === 'RestElement') {
          // Its argument can STILL be a pattern
          handleBindingPatternRecursively(
            element.argument as PatternLike,
            scope,
            onRecord,
            onLog,
          );
        } else {
          // element.type === 'PatternLike'
          handleBindingPatternRecursively(
            element as PatternLike,
            scope,
            onRecord,
            onLog,
          );
        }
      }
      break;

    case 'TSParameterProperty':
      warn('Encounter identifier type TSParameterProperty that intended not to handle');
  }
};

export default handleBindingPatternRecursively;
