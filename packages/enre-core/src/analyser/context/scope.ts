import {ENREEntityCollectionScoping} from '@enre/container';
import {panic} from '@enre/logging';

export default class extends Array<ENREEntityCollectionScoping> {
  last<T extends ENREEntityCollectionScoping = ENREEntityCollectionScoping>() {
    const last = this.at(-1);

    // Do not suppress the error, just explicitly throw it.
    if (!last) {
      panic('Unexpected access to undefined parent, this usually indicates the scoping mechanism is broken');
    }

    return last as T;
  }
}
