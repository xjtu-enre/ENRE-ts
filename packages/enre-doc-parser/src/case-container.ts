export interface CodeBlock {
  path: string;
  content: string;
}

export interface CaseContainer {
  code?: CodeBlock[];
  // TODO: Make type specific
  assertion: any;
}
