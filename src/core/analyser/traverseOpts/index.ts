import jsOpts from "./jsOpts";
import tsOpts from "./tsOpts";
import {sourceFileE} from '../entities/jsEntities';

export default (sourceFile: sourceFileE) => {
	return {
		...jsOpts(sourceFile),
		...tsOpts(sourceFile)
	}
}
