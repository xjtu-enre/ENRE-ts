interface CodeBlock {
  path: string;
  content: string;
}

export interface CaseContainer {
  code: Array<CodeBlock>;
  // TODO: Make type specific
  assertion: object | undefined;
}
