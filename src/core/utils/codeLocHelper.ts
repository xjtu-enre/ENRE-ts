export const toENRECodeLocation = (obj: any) => {
  return {
    start: {
      line: obj.start.line,
      column: obj.start.column
    },
    end: {
      line: obj.end.line,
      column: obj.end.column
    }
  };
};

export const buildCodeLocation = (
  startLine: number,
  startColumn: number,
  endLineOrLength: number,
  endColumn?: number
) => {
  return {
    start: {
      line: startLine,
      column: startColumn
    },
    end: {
      line: endColumn ? endLineOrLength : startLine,
      column: endColumn || (startColumn + endLineOrLength)
    }
  };
};
