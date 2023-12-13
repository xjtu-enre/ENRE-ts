/**
 * TSTypeAnnotation
 *
 * Extracted entities:
 *   * N/A
 *
 * Extracted relations:
 *   * type
 */

import {NodePath} from '@babel/traverse';
import {TSTypeAnnotation} from '@babel/types';
import {ENREContext} from '../context';
import {eGraph, ENRELogEntry, ENRERelationType, pseudoR} from '@enre-ts/data';
import {toENRELocation} from '@enre-ts/location';

type PathType = NodePath<TSTypeAnnotation>

export default (path: PathType, {file: {logs}, scope}: ENREContext) => {
  if (path.parent.type === 'ClassMethod' && path.parent.kind === 'constructor') {
    logs.add(path.node.loc!.start.line, ENRELogEntry['Type annotation cannot appear on a constructor declaration']);
    return;
  }

  const annotationType = path.node.typeAnnotation.type;

  if (annotationType === 'TSTypeReference') {
    const referenceType = path.node.typeAnnotation.typeName.type;
    if (referenceType === 'Identifier') {
      pseudoR.add<ENRERelationType>({
        type: 'type',
        from: {role: 'type', identifier: path.node.typeAnnotation.typeName.name, at: scope.last()},
        /**
         * In @babel/traverse, for a function/method, the 'returnType' node is visited after 'params' and
         * 'body', where eGraph.lastAdded may be overridden to param entity or any other declarations within
         * the function body. In these cases, we can utilize the current scope to refer to the function/method.
         *
         * Need to monitor if this condition is correct.
         */
        to: ['Identifier', 'ClassProperty'].includes(path.parent.type) ? eGraph.lastAdded! : scope.last(),
        location: toENRELocation(path.node.typeAnnotation.typeName.loc),
      });
    }
  } else if (annotationType === 'TSIndexedAccessType') {

  } else { // @ts-ignore
    if (annotationType === 'TSQualifiedName') {

    }
  }
};
