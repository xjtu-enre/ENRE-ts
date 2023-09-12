import {ENREEntityCollectionScoping, ENREEntityFile, id,} from '@enre/data';
import {logger} from '@enre/core';

export class ENREScope extends Array<id<ENREEntityCollectionScoping>> {
  constructor(file: id<ENREEntityFile>) {
    super();
    this.push(file);
  }

  last = <T = id<ENREEntityCollectionScoping>>() => {
    if (this.length >= 1) {
      return this.at(-1) as T;
    } else {
      logger.error('The scope stack is empty, which indicates the scope management is broken.');
      process.exit();
    }
  };
}
