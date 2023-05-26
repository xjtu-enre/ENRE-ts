import {ENRERelationCall} from './variant/call';
import {ENRERelationExport} from './variant/export';
import {ENRERelationExtend} from './variant/extend';
import {ENRERelationImplement} from './variant/implement';
import {ENRERelationImport} from './variant/import';
import {ENRERelationModify} from './variant/modify';
import {ENRERelationOverride} from './variant/override';
import {ENRERelationSet} from './variant/set';
import {ENRERelationType} from './variant/type';
import {ENRERelationUse} from './variant/use';
import {ENRERelationDecorate} from './variant/decorate';
import {ENRERelationAliasOf} from './variant/aliasof';

export type ENRERelationCollectionAll =
  ENRERelationExport
  | ENRERelationImport
  | ENRERelationAliasOf
  | ENRERelationCall
  | ENRERelationSet
  | ENRERelationUse
  | ENRERelationModify
  | ENRERelationExtend
  | ENRERelationOverride
  | ENRERelationDecorate
  | ENRERelationType
  | ENRERelationImplement;

export type ENRERelationTypes = ENRERelationCollectionAll['type'];
