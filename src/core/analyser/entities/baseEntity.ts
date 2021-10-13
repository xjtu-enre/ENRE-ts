import {allPossibleEntityTypes, allPossibleEntityTypesInASingleFile, location} from './entities';
import global from '../../utils/global';
import {sourceFileE} from './sourceFileEntity';

export interface baseE {
	readonly id: number,
	readonly name: string,
	readonly fullName: string,
	readonly parent: allPossibleEntityTypes,
	readonly sourceFile: undefined,
	readonly location: location,
	children: {
		add: (entity: allPossibleEntityTypesInASingleFile) => void,
		get: () => Array<allPossibleEntityTypesInASingleFile>
	}
}

export const baseEntity = (name: string, location: location, parent: allPossibleEntityTypes): baseE => {
	const _id: number = global.idGen();
	let _children: Array<allPossibleEntityTypesInASingleFile> = [];

	return {
		get id() {
			return _id;
		},

		get name() {
			return name;
		},

		get fullName() {
			// TODO: Path segment should be migrant from flat to hierarchical
			return 'Under development'
		},

		get parent() {
			return parent;
		},

		get sourceFile() {
			return undefined;
		},

		get location() {
			return location;
		},

		children: {
			add: (entity: allPossibleEntityTypesInASingleFile) => {
				_children.push(entity);
			},
			get: () => {
				return _children;
			}
		}
	}
}
