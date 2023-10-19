import {SourceLocation} from '@babel/types';

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
export type ENRELocation = {
  start: {
    line: number,
    column: number,
  },
  end?: {
    line?: number,
    column: number,
  },
};

export enum ToENRELocationPolicy {
  NoEnd,
  PartialEnd,
  Full,
}

export const defaultLocation = {start: {line: -1, column: -1}, end: {line: -1, column: -1}};

/**
 * ENRE style of code location offset starts from 1,
 * A config is applied to @babel/parser,
 * so it conforms to this with no addition manipulation.
 */
export const toENRELocation = (
  obj: SourceLocation | null | undefined,
  policy: ToENRELocationPolicy = ToENRELocationPolicy.NoEnd
): ENRELocation => {
  if (!obj) {
    return defaultLocation;
  }

  switch (policy) {
    case ToENRELocationPolicy.NoEnd:
      return {
        start: {
          line: obj.start.line,
          column: obj.start.column + 1,
        },
      };
    case ToENRELocationPolicy.PartialEnd:
      return {
        start: {
          line: obj.start.line,
          column: obj.start.column + 1,
        },
        end: {
          column: obj.end.column + 1,
        },
      };
    case ToENRELocationPolicy.Full:
      return {
        start: {
          line: obj.start.line,
          column: obj.start.column + 1,
        },
        end: {
          line: obj.end.line,
          column: obj.end.column + 1,
        },
      };
  }
};

// TODO: Import correct type
export const expandENRELocation = (obj: any) => {
  if (obj.location.end) {
    if (obj.location.end.line) {
      return buildFullLocation(
        obj.location.start.line,
        obj.location.start.column,
        obj.location.end.line,
        obj.location.end.column,
      );
    } else {
      return buildFullLocation(
        obj.location.start.line,
        obj.location.start.column,
        obj.location.start.line,
        obj.location.end.column,
      );
    }
  } else {
    return buildFullLocation(
      obj.location.start.line,
      obj.location.start.column,
      obj.name.codeLength,
    );
  }
};

export const buildFullLocation = (
  startLine: number,
  startColumn: number,
  endLineOrLength: number,
  endColumn?: number,
) => {
  return {
    start: {
      line: startLine,
      column: startColumn,
    },
    end: {
      line: endColumn ? endLineOrLength : startLine,
      column: endColumn || (startColumn + endLineOrLength),
    },
  };
};

export const isLocAInLocB = (locA: ENRELocation, locB: ENRELocation) => {
  if (!('end' in locB)) {
    throw 'Failed to test location inclusion: locB is not a range and has no end';
  } else if (!('line' in locB.end!)) {
    throw 'Failed to test location inclusion: locB is not a range and has no end.line';
  }

  return locB.start.line <= locA.start.line &&
    locB.start.column <= locA.start.column &&
    locA.start.line <= locB.end.line! &&
    locA.start.column <= locB.end.column;
};

export type ENRELocKey = {
  line: number,
  column: number,
}

export const toENRELocKey = (obj: SourceLocation | null | undefined): ENRELocKey => {
  if (!obj) {
    return {line: -1, column: -1};
  }

  return {
    line: obj.start.line,
    column: obj.start.column + 1,
  };
};
