import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../container/e';
import {ENREEntityBase, recordEntityBase} from './Base';
import {ENREEntityCollectionAll} from './collections';
import {ENREEntityField} from './Field';
import {ENREEntityMethod} from './Method';

export type TSModifier = 'public' | 'protected' | 'private';

// TODO: Add class static block
type ClassChildType = ENREEntityField | ENREEntityMethod;

export interface ENREEntityClass extends ENREEntityBase<ENREEntityCollectionAll, ClassChildType> {
  readonly type: 'class';
  readonly isAbstract: boolean;
}

export const recordEntityClass = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
  isAbstract = false,
): ENREEntityClass => {
  const _base = recordEntityBase<ENREEntityCollectionAll, ClassChildType>(name, location, parent);

  const _obj = {
    ..._base,

    get type() {
      return 'class' as const;
    },

    get isAbstract() {
      return isAbstract;
    }
  };

  eGraph.add(_obj);

  return _obj;
};
