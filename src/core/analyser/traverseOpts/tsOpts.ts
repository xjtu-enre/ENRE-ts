import {NodePath} from '@babel/traverse';
import {TSInterfaceDeclaration} from '@babel/types';

const TSInterfaceDeclaration = (path: NodePath<TSInterfaceDeclaration>) => {
	console.log('TSInterfaceDeclaration: ' + path.node.id.name)
}

export default {
	TSInterfaceDeclaration
}
