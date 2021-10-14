import {NodePath} from '@babel/traverse';
import {TSInterfaceDeclaration} from '@babel/types';
import {sourceFileE} from '../entities/sourceFileEntity';

const TSInterfaceDeclaration = (f: sourceFileE) => {
	return (path: NodePath<TSInterfaceDeclaration>) => {
		console.log('TSInterfaceDeclaration: ' + path.node.id.name)
	}
}

export default (sourceFile: sourceFileE) => {
	return {
		'TSInterfaceDeclaration': TSInterfaceDeclaration(sourceFile)
	}
}
