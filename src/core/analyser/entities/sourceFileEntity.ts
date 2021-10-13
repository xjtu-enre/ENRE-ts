import {allPossibleEntityTypesInASingleFile} from './entities';
import global from '../../utils/global';
import path from 'path';

export interface sourceFileE{
	readonly id: number,
	readonly name: string,
	readonly fullName: string,
	readonly type: "sourceFile",
	children: {
		add: (entity: allPossibleEntityTypesInASingleFile) => void,
		get: () => Array<number>
	},
	imports: {
		add: (entity: allPossibleEntityTypesInASingleFile) => void,
		get: () => Array<number>
	},
	exports: {
		add: (entity: allPossibleEntityTypesInASingleFile) => void,
		get: () => Array<number>
	}
}

export const sourceFileEntity = (fileName: string, pathSegment: Array<string>): sourceFileE => {
	const _id: number = global.idGen();
	let _children: Array<allPossibleEntityTypesInASingleFile> = [];
	let _imports: Array<allPossibleEntityTypesInASingleFile> = [];
	let _exports: Array<allPossibleEntityTypesInASingleFile> = [];

	const _obj = {
		get id() {
			return _id;
		},
		get name() {
			return fileName;
		},
		get fullName() {
			return path.resolve(...pathSegment, fileName);
		},
		get type() {
			return "sourceFile" as "sourceFile";
		},
		children: {
			add: (entity: allPossibleEntityTypesInASingleFile) => {
				_children.push(entity);
			},
			get: () => {
				return _children;
			}
		},
		imports: {
			add: (entity: allPossibleEntityTypesInASingleFile) => {
				_imports.push(entity);
			},
			get: () => {
				return _imports;
			}
		},
		exports: {
			add: (entity: allPossibleEntityTypesInASingleFile) => {
				_imports.push(entity);
			},
			get: () => {
				return _exports;
			}
		}
	}

	global.eList.add(_obj);

	return _obj;
}
