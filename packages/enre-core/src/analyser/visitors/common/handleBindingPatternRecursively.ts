import {ArrayPattern, Identifier, ObjectPattern, PatternLike, SourceLocation, TSParameterProperty} from '@babel/types';
import {ENREEntityField, ENREEntityParameter, ENREEntityVariable, TSModifier} from '@enre/container';
import {ENRELocation, toENRELocation} from '@enre/location';
import {error, warn} from '@enre/logging';
import {ENREContext} from '../../context';

let mTSModifier: TSModifier | undefined = undefined;

const handleBindingPatternRecursively = <T extends ENREEntityVariable | ENREEntityParameter>(
  id: PatternLike | TSParameterProperty,
  scope: ENREContext['scope'],
  onRecord: (
    name: string,
    location: ENRELocation,
    scope: ENREContext['scope'],
  ) => T,
  onLog: (entity: T) => void,
  onRecordConstructorField?: (
    name: string,
    location: ENRELocation,
    scope: ENREContext['scope'],
    TSModifier: TSModifier,
  ) => ENREEntityField,
  onLogConstructorField?: (entity: ENREEntityField) => void,
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

      if (mTSModifier && onRecordConstructorField) {
        const fieldEntity = onRecordConstructorField(
          id.name,
          toENRELocation(id.loc as SourceLocation),
          scope,
          mTSModifier,
        );
        /**
         * Missing log function is allowed.
         */
        onLogConstructorField ? onLogConstructorField(fieldEntity) : undefined;
      }
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
      mTSModifier = id.accessibility ?? undefined;
      if (id.parameter.type === 'Identifier') {
        handleBindingPatternRecursively(
          id.parameter,
          scope,
          onRecord,
          onLog,
          onRecordConstructorField,
          onLogConstructorField,
        );
      } else {
        // id.parameter.type === 'AssignmentPattern'
        if (id.parameter.left.type === 'Identifier') {
          handleBindingPatternRecursively(
            id.parameter.left,
            scope,
            onRecord,
            onLog,
            onRecordConstructorField,
            onLogConstructorField,
          );
        } else if (['ArrayPattern', 'ObjectPattern'].indexOf(id.parameter.left.type) > -1) {
          if (mTSModifier) {
            error(`TSError: A parameter property(field) may not be declared using a ${id.parameter.left.type}.`);
            /**
             * In this case, only extract parameters but not fields.
             */
            mTSModifier = undefined;
          }

          handleBindingPatternRecursively(
            id.parameter.left as ArrayPattern | ObjectPattern,
            scope,
            onRecord,
            onLog,
          );
        } else {
          warn(`Unhandled BindingPattern type ${id.parameter.left.type}`);
        }
      }
      break;
  }
};

export default handleBindingPatternRecursively;
