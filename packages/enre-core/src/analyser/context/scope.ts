import {ENREEntityCollectionScoping, ENREEntityFile,} from '@enre/container';

export class ENREScope extends Array<ENREEntityCollectionScoping> {
  constructor(file: ENREEntityFile) {
    super();
    this.push(file);
  }

  last = <T = ENREEntityCollectionScoping>() => {
    if (this.length >= 1) {
      return this.at(-1) as T;
    } else {
      throw 'The scope stack is empty, which indicates the scope management is broken.';
    }
  };
}
