/**
 * TSImportEqualsDeclaration
 *
 * Extracted relations:
 *   * Import (Namespace)
 *   * Export (Namespace)
 */

import {NodePath} from '@babel/traverse';
import {TSImportEqualsDeclaration} from '@babel/types';
import {ENREContext} from '../context';

type PathType = NodePath<TSImportEqualsDeclaration>

export default (path: PathType, {scope}: ENREContext) => {
  
};
