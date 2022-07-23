import {ENREEntityClass, ENREEntityInterface} from '@enre/container';
import {ENRERelationExtend} from './Extend';
import {ENRERelationImplement} from './Implement';

export type ENRERelationCollectionAll =
  ENRERelationExtend<ENREEntityClass | ENREEntityInterface>
  | ENRERelationImplement;

export type ENRERelationTypes = ENRERelationCollectionAll['type'];
