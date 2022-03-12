/**
 * ENRE's style of code location offset starts from 1,
 * babel's: line offset 1, column offset 0.
 * @param obj
 */
export const toENRECodeLocation = (obj: any) => {
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
};

export const buildCodeLocation = (
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
