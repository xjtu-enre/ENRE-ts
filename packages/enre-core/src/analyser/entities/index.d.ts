import {ENREEntityClass} from './eClass';
import {ENREEntityEnum} from './eEnum';
import {ENREEntityEnumMember} from './eEnumMember';
import {ENREEntityField} from './eField';
import {ENREEntityFile} from './eFile';
import {ENREEntityFunction} from './eFunction';
import {ENREEntityMethod} from './eMethod';
import {ENREEntityParameter} from './eParameter';
import {ENREEntityVariable} from './eVariable';

declare type ENREEntityCollectionInFile =
  ENREEntityVariable
  | ENREEntityFunction
  | ENREEntityParameter
  | ENREEntityClass
  | ENREEntityField
  | ENREEntityMethod
  | ENREEntityEnum
  | ENREEntityEnumMember;

declare type ENREEntityCollectionAll = ENREEntityFile | ENREEntityCollectionInFile;

declare type ENREEntityCollectionScoping =
  ENREEntityFile
  | ENREEntityFunction
  | ENREEntityClass
  | ENREEntityMethod
  | ENREEntityEnum;
