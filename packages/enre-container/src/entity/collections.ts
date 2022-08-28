import {ENREEntityClass} from './Class';
import {ENREEntityEnum} from './Enum';
import {ENREEntityEnumMember} from './EnumMember';
import {ENREEntityField} from './Field';
import {ENREEntityFile} from './File';
import {ENREEntityFunction} from './Function';
import {ENREEntityInterface} from './Interface';
import {ENREEntityMethod} from './Method';
import {ENREEntityNamespace} from './Namespace';
import {ENREEntityParameter} from './Parameter';
import {ENREEntityProperty} from './Property';
import {ENREEntityTypeAlias} from './TypeAlias';
import {ENREEntityTypeParameter} from './TypeParameter';
import {ENREEntityVariable} from './Variable';

export type ENREEntityCollectionInFile =
  ENREEntityVariable
  | ENREEntityFunction
  | ENREEntityParameter
  | ENREEntityClass
  | ENREEntityField
  | ENREEntityMethod
  | ENREEntityProperty
  | ENREEntityNamespace
  | ENREEntityTypeAlias
  | ENREEntityEnum
  | ENREEntityEnumMember
  | ENREEntityInterface
  | ENREEntityTypeParameter;

export type ENREEntityCollectionAll = ENREEntityFile | ENREEntityCollectionInFile;

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
  | ENREEntityInterface;

export type ENREEntityTypes = ENREEntityCollectionAll['type'];
