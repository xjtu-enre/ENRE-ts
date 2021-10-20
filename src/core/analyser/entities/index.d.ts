import {SourceLocation} from '@babel/types';

import {ENREEntityFile} from './eFile';
import {ENREEntityVariable} from './eVariable';

declare type ENRECodeLocation = SourceLocation;

declare type ENREEntityInFile = ENREEntityVariable;

declare type ENREEntityAll = ENREEntityFile | ENREEntityInFile;

declare type ENREEntityScopeMaking = ENREEntityFile;
