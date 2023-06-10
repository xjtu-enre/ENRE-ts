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
import {eGraph, ENRERelationType, pseudoR} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {error} from '@enre/logging';
import {ENREi18nen_US} from '../../i18n/en_US/ts-compiling';

type PathType = NodePath<TSTypeAnnotation>

export default (path: PathType, {scope}: ENREContext) => {
  if (path.parent.type === 'ClassMethod' && path.parent.kind === 'constructor') {
    error(ENREi18nen_US['Type annotation cannot appear on a constructor declaration']);
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
        to: path.parent.type !== 'Identifier' ? scope.last() : eGraph.lastAdded!,
        location: toENRELocation(path.node.typeAnnotation.typeName.loc),
      });
    }
  } else if (annotationType === 'TSIndexedAccessType') {

  } else { // @ts-ignore
    if (annotationType === 'TSQualifiedName') {

    }
  }
};
