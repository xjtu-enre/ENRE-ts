import {ENREEntityFile} from './eFile';
import {ENREEntityVariable} from './eVariable';
import {ENREEntityFunction} from './eFunction';
import {ENREEntityParameter} from './eParameter';
import {ENREEntityClass} from './eClass';
import {ENREEntityField} from './eField';
import {ENREEntityMethod} from './eMethod';

declare type ENREEntityCollectionInFile =
  ENREEntityVariable
  | ENREEntityFunction
  | ENREEntityParameter
  | ENREEntityClass
  | ENREEntityField
  | ENREEntityMethod;

declare type ENREEntityCollectionAll = ENREEntityFile | ENREEntityCollectionInFile;

declare type ENREEntityCollectionScoping = ENREEntityFile | ENREEntityFunction | ENREEntityClass | ENREEntityMethod;
