import {NodePath} from '@babel/traverse';
import {Identifier, VariableDeclaration, VariableDeclarator} from '@babel/types';
import {sourceFileE, sourceFileEntity} from '../entities/sourceFileEntity';
import global from '../../utils/global';
import {debug} from '../../utils/cliRender';

// const Identifier = (path: NodePath<Identifier>) => {
// 	console.log('Identifier: ' + path.node.name)
// }

const Identifier = (f: sourceFileE) => {
	return (path: NodePath<Identifier>) => {
		// console.log('Identifier: ' + path.node.name)
		// const idEntity = sourceFileEntity(path.node.name, []);
		// global.eList.add(idEntity);
		// f.children.add(idEntity.id);
	}
}

const VariableDeclaration = (f: sourceFileE) => {
	return (path: NodePath<VariableDeclaration>) => {
		const kind = path.node.kind;
		for (const declarator of path.node.declarations) {
			switch (declarator.id.type) {
			case 'Identifier':
				debug('VariableDeclaration: ' + declarator.id.name)
				break;
			case 'ObjectPattern':
				for (const obj of declarator.id.properties) {
					if (obj.type === 'ObjectProperty') {
						// @ts-ignore
						debug('VariableDeclaration: ' + obj.value.name)
					} else {	// RestElement
						// @ts-ignore
						debug('VariableDeclaration: ' + obj.argument.name)
					}
				}
				break;
			case 'ArrayPattern':
				for (const element of declarator.id.elements) {
					// @ts-ignore
					debug('VariableDeclaration: ' + element.name)
				}
				break;
			}
		}
	}
}

export default (sourceFile: sourceFileE) => {
	return {
		'Identifier': Identifier(sourceFile),
		'VariableDeclaration': VariableDeclaration(sourceFile)
	}
}
