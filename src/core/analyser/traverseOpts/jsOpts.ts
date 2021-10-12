import {NodePath} from '@babel/traverse';
import {Identifier} from '@babel/types';
import {sourceFileE, sourceFileEntity} from '../entities/jsEntities';
import global from '../../utils/global';

// const Identifier = (path: NodePath<Identifier>) => {
// 	console.log('Identifier: ' + path.node.name)
// }

const Identifier = (f: sourceFileE) => {
	return (path: NodePath<Identifier>) => {
		console.log('Identifier: ' + path.node.name)
		const idEntity = sourceFileEntity(path.node.name, []);
		global.eList.add(idEntity);
		f.children.add(idEntity.id);
	}
}

export default (sourceFile: sourceFileE) => {
	return {
		'Identifier': Identifier(sourceFile)
	}
}
