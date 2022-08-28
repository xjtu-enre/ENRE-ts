import {ENREEntityClass} from '../entity/Class';
import {ENREEntityInterface} from '../entity/Interface';
import {ENREEntityTypeParameter} from '../entity/TypeParameter';
import {ENRERelationCall} from './Call';
import {ENRERelationExport} from './Export';
import {ENRERelationExtend} from './Extend';
import {ENRERelationImplement} from './Implement';
import {ENRERelationImport} from './Import';
import {ENRERelationModify} from './Modify';
import {ENRERelationOverride} from './Override';
import {ENRERelationSet} from './Set';
import {ENRERelationType} from './Type';
import {ENRERelationUse} from './Use';

export type ENRERelationCollectionAll =
  ENRERelationExport
  | ENRERelationImport
  | ENRERelationCall
  | ENRERelationSet
  | ENRERelationUse
  | ENRERelationModify
  | ENRERelationExtend<ENREEntityClass | ENREEntityInterface | ENREEntityTypeParameter>
  | ENRERelationOverride
  | ENRERelationType
  | ENRERelationImplement;

export type ENRERelationTypes = ENRERelationCollectionAll['type'];
