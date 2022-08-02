import {ENREEntityClass} from '../entity/Class';
import {ENREEntityInterface} from '../entity/Interface';
import {ENRERelationExtend} from './Extend';
import {ENRERelationImplement} from './Implement';

export type ENRERelationCollectionAll =
  ENRERelationExtend<ENREEntityClass | ENREEntityInterface>
  | ENRERelationImplement;

export type ENRERelationTypes = ENRERelationCollectionAll['type'];
