/**
 * String-representation of entity reference specifier
 *
 * Format:
 *   <entity type>:<'<entity name>' | '<entity qualified name>'>[predicates]
 *
 * * `<entity type>` is the type of the referenced entity.
 *
 * * `'<entity name>'` is the short name of the entity, MUST be wrapped with single quotes.
 *
 * * `'<entity qualified name>'` is the full qualified name of the entity, MUST be wrapped with single quotes.
 *
 * * `[predicates]` are optional advanced query conditions that in case type+name is not enough to filter only
 *   one candidate, this is basically an inline form of the format of entity items in YAML block, and follows the XPath
 *   syntax of declaring properties, supported properties including:
 *
 *   + @loc=<loc> - Filtering with entity location, which follows the syntax of loc-meta.
 *
 *   + @<prop>=<value> - Any other properties that an entity would contain.
 *     NOTE: prop name is internal name rather than yaml name.
 *
 *   Multiple properties has to be separated with one space.
 *
 * Examples:
 *   * class:'Foo'                           - A class entity named 'Foo'.
 *   * function:'Foo.bar'                    - A function entity with qualified name as 'Foo.bar'.
 *   * parameter:'a'[@loc=2]                 - A parameter entity named 'a' and its start line is 2.
 *   * parameter:'Foo.b'[@loc=file1:3:4:3:5] - A parameter entity with qualified name as 'Foo.b' and location as described.
 *   * function:'foo'[@async=true @get=true] - A function entity named 'foo' and is an async getter.
 */
import locMetaParser, {LocSchema} from '../loc-meta';
import {createFSMInstance} from './rule';

export interface EntityRefSchema {
  type: string,
  name: string,
  isFullName: boolean,
  predicates?: {
    loc?: LocSchema,
    [key: string]: string | boolean | LocSchema | undefined,
  }
}

export default (content: string): EntityRefSchema => {
  const highlight = (index: number) => {
    return content.substring(0, index) + '[' + content.at(index) + ']' + content.substring(index + 1);
  };

  const {fsm, next, alter} = createFSMInstance();

  const obj = {isFullName: false} as EntityRefSchema;

  let memoPrevIndex = -1;
  let unmatchedKey = '';

  for (const [i, v] of [...content, undefined].entries()) {
    let resolved = false;

    do {
      switch (fsm.state.value) {
        case 'entityType':
          if (!v) {
            if (i === 0) {
              throw 'Unexpected empty entity reference specifier';
            } else {
              next();
              break;
            }
          }

          if (!/[a-zA-Z ]/.test(v)) {
            next();
            break;
          }

          resolved = true;
          break;

        case 'colon':
          if (!v) {
            throw 'Unexpected end of entity reference specifier, expecting :';
          }

          if (v !== ':') {
            throw `Unexpected char '${v}' at ${highlight(i)}, expecting :`;
          }

          obj.type = content.substring(0, i).toLowerCase();
          resolved = true;
          next();
          break;

        case 'nameWrapperLeftQuote':
          if (!v) {
            throw 'Unexpected end of entity reference specifier, expecting left \'';
          }

          if (v !== '\'') {
            throw `Unexpected char '${v}' at ${highlight(i)}, expecting left '`;
          }

          resolved = true;
          next();
          memoPrevIndex = i + 1;
          break;

        case 'entityName':
          if (!v) {
            next();
          }

          if (v === '\'') {
            next();
            break;
          }

          resolved = true;
          break;

        case 'nameWrapperRightQuote':
          if (!v) {
            throw 'Unexpected end of entity reference specifier, expecting right \'';
          }

          if (v !== '\'') {
            throw `Unexpected char '${v}' at ${highlight(i)}, expecting right '`;
          }

          obj.name = content.substring(memoPrevIndex, i);
          if (obj.name.includes('.')) {
            obj.isFullName = true;
          }

          resolved = true;
          next();
          break;

        case 'predicatesWrapperLeftBracket':
          if (!v) {
            resolved = true;
            break;
          }

          if (v !== '[') {
            throw `Unexpected char '${v}' at ${highlight(i)}, expecting [`;
          }

          resolved = true;
          next();
          break;

        case 'predicateAt':
          if (!v) {
            throw 'Unexpected end of entity reference specifier, expecting @';
          }

          if (v !== '@') {
            if (v === ']') {
              alter();
              break;
            }
            throw `Unexpected char '${v}' at ${highlight(i)}, expecting @`;
          }

          resolved = true;
          next();
          memoPrevIndex = i + 1;
          break;

        case 'predicateKey':
          if (!v) {
            next();
            break;
          }

          if (!/[a-zA-Z]/.test(v)) {
            next();
            break;
          }

          resolved = true;
          break;

        case 'predicateIs':
          if (!v) {
            throw 'Unexpected end of entity reference specifier, expecting =';
          }

          if (v !== '=') {
            throw `Unexpected char '${v}' at ${highlight(i)}, expecting =`;
          }

          unmatchedKey = content.substring(memoPrevIndex, i);
          memoPrevIndex = i + 1;
          resolved = true;
          next();
          break;

        case 'predicateValue': {
          if (!v) {
            throw 'Unexpected end of entity reference specifier';
          }

          let meetValueEnd = false;

          if (v === ' ') {
            meetValueEnd = true;
            next();
          }

          if (v === ']') {
            meetValueEnd = true;
            alter();
          }

          if (meetValueEnd) {
            let value: boolean | string = content.substring(memoPrevIndex, i);
            if (/true|false/.test(value)) {
              value = value === 'true';
            }

            if (unmatchedKey === 'loc' && typeof value === 'boolean') {
              throw 'Unexpected key-value pair for loc, expecting location string';
            }

            (obj.predicates || (obj.predicates = {}))[unmatchedKey] = unmatchedKey === 'loc' ? locMetaParser(value as string) : value;
            break;
          }

          resolved = true;
          break;
        }

        case 'predicateSpace':
          if (!v) {
            throw 'Unexpected end of entity reference specifier';
          }

          if (v !== ' ') {
            if (v === '@') {
              next();
              break;
            } else {
              throw `Unexpected char '${v}' at ${highlight(i)}, expecting @`;
            }
          }

          resolved = true;
          break;

        case 'predicatesWrapperRightBracket':
          if (!v) {
            throw 'Unexpected end of entity reference specifier, expecting ]';
          }

          if (v !== ']') {
            throw `Unexpected char '${v}' at ${highlight(i)}, expecting ]`;
          }

          resolved = true;
          next();
          break;

        case'end':
          if (!v) {
            resolved = true;
            break;
          }

          throw `Unexpected continuing char after index ${highlight(i)}, entity reference specifier should end here`;
      }
    } while (!resolved);
  }

  return obj;
};
