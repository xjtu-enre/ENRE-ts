import {ENREEntityFile} from '@enre/container';
import Scope from './scope';

export class ENREContext {
  scope: Scope;
  regulator: Array<any>;

  constructor(public file: ENREEntityFile) {
    this.scope = new Scope();
    // Instantly push file as the top scope
    this.scope.push(file);
    this.regulator = [];
  }
}
