import jsOpts from "./jsOpts";
import tsOpts from "./tsOpts";
import {sourceFileE} from '../entities/sourceFileEntity';

export default (sourceFile: sourceFileE) => {
	return {
		...jsOpts(sourceFile),
		...tsOpts(sourceFile)
	}
}
