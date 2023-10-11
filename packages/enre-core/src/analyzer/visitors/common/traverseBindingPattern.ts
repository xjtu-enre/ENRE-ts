import {ArrayPattern, Identifier, ObjectPattern, PatternLike, SourceLocation, TSParameterProperty} from '@babel/types';
import {ENREEntityField, ENREEntityParameter, ENREEntityVariable, id} from '@enre/data';
import {ENRELocation, toENRELocation} from '@enre/location';
import {ENREContext} from '../../context';
import {TSVisibility} from '@enre/shared';

let mTSModifier: TSVisibility | undefined = undefined;

export default function traverseBindingPattern<T extends id<ENREEntityVariable> | id<ENREEntityParameter>>(
  id: PatternLike | TSParameterProperty,
  scope: ENREContext['scope'],
  onRecord: (
    name: string,
    location: ENRELocation,
    scope: ENREContext['scope'],
  ) => T,
  onRecordConstructorField?: (
    name: string,
    location: ENRELocation,
    scope: ENREContext['scope'],
    TSVisibility: TSVisibility,
  ) => ENREEntityField,
): T | undefined {
  let entity;

  switch (id.type) {
    case 'Identifier':
      entity = onRecord(
        id.name,
        toENRELocation(id.loc as SourceLocation),
        scope,
      );

      if (mTSModifier && onRecordConstructorField) {
        const fieldEntity = onRecordConstructorField(
          id.name,
          toENRELocation(id.loc as SourceLocation),
          scope,
          mTSModifier,
        );
      }
      break;

    case 'RestElement':
      traverseBindingPattern(
        id.argument as Identifier,
        scope,
        onRecord,
      );
      break;

    case 'AssignmentPattern':
      traverseBindingPattern(
        id.left as PatternLike,
        scope,
        onRecord,
      );
      break;

    case 'ObjectPattern':
      for (const property of id.properties) {
        if (property.type === 'RestElement') {
          // Its argument can ONLY be Identifier
          traverseBindingPattern(
            property.argument as Identifier,
            scope,
            onRecord,
          );
        } else {
          // property.type === 'ObjectProperty'
          traverseBindingPattern(
            property.value as PatternLike,
            scope,
            onRecord,
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
          traverseBindingPattern(
            element.argument as PatternLike,
            scope,
            onRecord,
          );
        } else {
          // element.type === 'PatternLike'
          traverseBindingPattern(
            element as PatternLike,
            scope,
            onRecord,
          );
        }
      }
      break;

    case 'TSParameterProperty':
      mTSModifier = id.accessibility ?? undefined;
      if (id.parameter.type === 'Identifier') {
        traverseBindingPattern(
          id.parameter,
          scope,
          onRecord,
          onRecordConstructorField,
        );
      } else {
        // id.parameter.type === 'AssignmentPattern'
        if (id.parameter.left.type === 'Identifier') {
          traverseBindingPattern(
            id.parameter.left,
            scope,
            onRecord,
            onRecordConstructorField,
          );
        } else if (['ArrayPattern', 'ObjectPattern'].indexOf(id.parameter.left.type) > -1) {
          if (mTSModifier) {
            // console.error(`TSError: A parameter property(field) may not be declared using a ${id.parameter.left.type}.`);
            /**
             * In this case, only extract parameters but not fields.
             */
            mTSModifier = undefined;
          }

          traverseBindingPattern(
            id.parameter.left as ArrayPattern | ObjectPattern,
            scope,
            onRecord,
          );
        } else {
          // console.warn(`Unhandled BindingPattern type ${id.parameter.left.type}`);
        }
      }
      break;
  }

  return entity;
}
