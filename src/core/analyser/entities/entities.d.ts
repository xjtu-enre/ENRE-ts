import {sourceFileE} from './jsEntities';

declare interface location {
	start: {
		row: number,
		column: number
	},
	end: {
		row: number,
		column: number
	}
}

declare type allPossibleEntityTypes = sourceFileE;

declare type allPossibleEntityTypesInASingleFile = number;
