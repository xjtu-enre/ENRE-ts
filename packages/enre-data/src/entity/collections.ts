import {ENREEntityClass} from './variant/class';
import {ENREEntityEnum} from './variant/enum';
import {ENREEntityEnumMember} from './variant/enum-member';
import {ENREEntityField} from './variant/field';
import {ENREEntityFile} from './structure/file';
import {ENREEntityFunction} from './variant/function';
import {ENREEntityInterface} from './variant/interface';
import {ENREEntityMethod} from './variant/method';
import {ENREEntityNamespace} from './variant/namespace';
import {ENREEntityParameter} from './variant/parameter';
import {ENREEntityProperty} from './variant/property';
import {ENREEntityTypeAlias} from './variant/type-alias';
import {ENREEntityTypeParameter} from './variant/type-parameter';
import {ENREEntityVariable} from './variant/variable';
import {ENREEntityAlias} from './variant/alias';
import {ENREEntityPackage} from './structure/package';
import {ENREEntityUnknown} from './structure/unknown';
import {ENREEntityBlock} from './structure/block';

export type ENREEntityCollectionInFile =
  ENREEntityVariable
  | ENREEntityFunction
  | ENREEntityParameter
  | ENREEntityClass
  | ENREEntityField
  | ENREEntityMethod
  | ENREEntityProperty
  | ENREEntityAlias
  | ENREEntityNamespace
  | ENREEntityTypeAlias
  | ENREEntityEnum
  | ENREEntityEnumMember
  | ENREEntityInterface
  | ENREEntityTypeParameter
  | ENREEntityUnknown
// | ENREEntityMerged (Not ready)
  | ENREEntityBlock;

export type ENREEntityCollectionAll = ENREEntityPackage | ENREEntityFile | ENREEntityCollectionInFile;

export type ENREEntityCollectionScoping =
  ENREEntityFile
  | ENREEntityVariable
  | ENREEntityFunction
  | ENREEntityClass
  | ENREEntityMethod
  | ENREEntityProperty
  | ENREEntityNamespace
  | ENREEntityTypeAlias
  | ENREEntityEnum
  | ENREEntityInterface
  | ENREEntityBlock;

export type ENREEntityCollectionAnyChildren =
  ENREEntityFile
  | ENREEntityVariable
  | ENREEntityFunction
  | ENREEntityMethod
  | ENREEntityProperty
  | ENREEntityNamespace
  | ENREEntityTypeAlias
  | ENREEntityInterface;

export type ENREEntityCollectionCallable =
  ENREEntityFunction
  | ENREEntityMethod;

export type ENREEntityTypes = ENREEntityCollectionAll['type'];
