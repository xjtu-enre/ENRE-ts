import {SourceLocation} from '@babel/types';
import {ENREEntityCollectionInFile} from '../analyser/entities';

export enum ToENRELocationPolicy {
  NoEnd,
  PartialEnd,
  Full,
}

/**
 * ENRE's style of code location offset starts from 1,
 * babel's: line offset 1, column offset 0.
 */
export const toENRELocation = (
  obj: SourceLocation,
  policy: ToENRELocationPolicy = ToENRELocationPolicy.NoEnd
) => {
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

export const expandENRELocation = (obj: ENREEntityCollectionInFile) => {
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
      obj.name.codeName.length,
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
