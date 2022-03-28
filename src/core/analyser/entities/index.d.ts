import {ENREEntityFile} from './eFile';
import {ENREEntityVariable} from './eVariable';
import {ENREEntityFunction} from './eFunction';
import {ENREEntityParameter} from './eParameter';
import {ENREEntityClass} from './eClass';

/**
 * A more concise way to express entity location.
 * Helps to reduce redundant properties and allows saving anonymous entity's location also.
 *
 * The legacy way to express entity location is by tuple:
 *   [loc.start.line, loc.start.column, loc.end.line, loc.end.column]
 *
 * If end === undefined:
 *   An entity's location can be calculated by
 *     [
 *       start.line,
 *       start.column,
 *       start.line,
 *       start.column + entity.name.length,
 *     ]
 *   Notice that entity.name.length can be 0, which is exactly an anonymous entity.
 * If end.line === undefined:
 *   An entity's location can be calculated by
 *     [
 *       start.line,
 *       start.column,
 *       start.line,
 *       end.column,
 *     ]
 * If all properties exist:
 *   An entity's location can be calculated by
 *     [
 *       start.line,
 *       start.column,
 *       end.line,
 *       end.column,
 *     ]
 */
declare type ENRELocation = {
  start: {
    line: number,
    column: number,
  },
  end?: {
    line?: number,
    column: number,
  },
};

declare type ENREEntityCollectionInFile =
  ENREEntityVariable
  | ENREEntityFunction
  | ENREEntityParameter
  | ENREEntityClass;

declare type ENREEntityCollectionAll = ENREEntityFile | ENREEntityCollectionInFile;

declare type ENREEntityCollectionScoping = ENREEntityFile | ENREEntityFunction | ENREEntityClass;
