import {ENREEntityClass} from './Class';
import {ENREEntityEnum} from './Enum';
import {ENREEntityEnumMember} from './EnumMember';
import {ENREEntityField} from './Field';
import {ENREEntityFile} from './File';
import {ENREEntityFunction} from './Function';
import {ENREEntityMethod} from './Method';
import {ENREEntityParameter} from './Parameter';
import {ENREEntityVariable} from './Variable';

export type ENREEntityCollectionInFile =
  ENREEntityVariable
  | ENREEntityFunction
  | ENREEntityParameter
  | ENREEntityClass
  | ENREEntityField
  | ENREEntityMethod
  | ENREEntityEnum
  | ENREEntityEnumMember;

export type ENREEntityCollectionAll = ENREEntityFile | ENREEntityCollectionInFile;

export type ENREEntityCollectionScoping =
  ENREEntityFile
  | ENREEntityFunction
  | ENREEntityClass
  | ENREEntityMethod
  | ENREEntityEnum;

export type ENREEntityTypes = ENREEntityCollectionAll['type'];
