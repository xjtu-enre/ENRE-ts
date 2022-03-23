import {Identifier, PatternLike, SourceLocation} from '@babel/types';
import {ENREEntityCollectionScoping, ENRELocation} from '../../entities';
import {ENREEntityVariable} from '../../entities/eVariable';
import {toENRELocation} from '../../../utils/locationHelper';
import {ENREEntityParameter} from '../../entities/eParameter';

const handleBindingPatternRecursively = <T extends ENREEntityVariable | ENREEntityParameter>(
  id: PatternLike,
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
  }
};

export default handleBindingPatternRecursively;
