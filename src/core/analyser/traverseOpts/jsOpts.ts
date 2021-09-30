import {NodePath} from '@babel/traverse';
import {Identifier} from '@babel/types';

const Identifier = (path: NodePath<Identifier>) => {
	console.log('Identifier: ' + path.node.name)
}

export default {
	Identifier
}
