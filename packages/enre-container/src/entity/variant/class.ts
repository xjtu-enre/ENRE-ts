import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../../container/e';
import {ENREEntityAbilityBase, recordEntityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../collections';
import {ENREEntityField} from './field';
import {ENREEntityMethod} from './method';
import {ENREEntityAbilityAbstractable} from '../ability/abstractable';

type ClassChildType = ENREEntityField | ENREEntityMethod;

export interface ENREEntityClass extends ENREEntityAbilityBase<ENREEntityCollectionAll, ClassChildType>, ENREEntityAbilityAbstractable {
  readonly type: 'class';
}

export const recordEntityClass = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
  {
    isAbstract = false,
  },
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
