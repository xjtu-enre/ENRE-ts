import {ENREEntityCollectionScoping} from '@enre/container';

export default class extends Array<ENREEntityCollectionScoping> {
  last<T extends ENREEntityCollectionScoping = ENREEntityCollectionScoping>() {
    /**
     * Force cast to T to omit undefined,
     * since this method is usually called after a package/file entity was pushed
     * as the first element.
     */
    return this.at(-1) as T;
  }
}
