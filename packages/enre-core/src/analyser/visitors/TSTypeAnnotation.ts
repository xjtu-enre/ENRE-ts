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

export default ({scope}: ENREContext) => {
  return (path: NodePath<TSTypeAnnotation>) => {
    const annotationType = path.node.typeAnnotation.type;
    // TODO: Handle built-in types
    if (annotationType === 'TSTypeReference') {
      const referenceType = path.node.typeAnnotation.typeName.type;
      if (referenceType === 'Identifier') {
        // pseudoR.add<ENRERelationType>({
        //   type: 'type',
        //   from: undefined,
        //   to: {role: 'type', identifier: path.node.typeAnnotation.typeName.name},
        //   location: toENRELocation(path.node.typeAnnotation.typeName.loc),
        //   at: scope.last(),
        // });
      }
    }
  };
};
