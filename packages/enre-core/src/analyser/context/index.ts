import {ENREEntityFile} from '@enre/container';
import {CommandStack} from './commandStack';
import Scope from './scope';

export class ENREContext {
  scope: Scope;
  cs: CommandStack;

  constructor(public file: ENREEntityFile) {
    this.scope = new Scope();
    // Instantly push file as the top scope
    this.scope.push(file);

    this.cs = new CommandStack();
  }
}
