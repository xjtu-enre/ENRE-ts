/**
 * ExportAllDeclaration
 *
 * Extracted entities:
 *   N/A
 *
 * Extracted relations:
 *   * Export
 */
import {NodePath} from '@babel/traverse';
import {ExportAllDeclaration} from '@babel/types';
import {ENREContext} from '../context';
import {warn} from '@enre/logging';
import {ENREi18nen_US} from '../../i18n/en_US/js-compiling';
import moduleResolver from '../module-resolver';
import {recordRelationExport} from '@enre/container';
import {toENRELocation, ToENRELocationPolicy} from '@enre/location';

type PathType = NodePath<ExportAllDeclaration>

export default (path: PathType, {scope}: ENREContext) => {
  const lastScope = scope.last();

  if (lastScope.type !== 'file') {
    warn(ENREi18nen_US['An export declaration can only be used at the top level of a module']);
    return;
  }

  const symbolRole = path.node.exportKind === 'type' ? 'type' : 'any';

  const resolvedModule = moduleResolver(lastScope, path.node.source.value);
  if (resolvedModule) {
    recordRelationExport(
      lastScope,
      resolvedModule,
      toENRELocation(path.node.loc),
      {
        kind: symbolRole,
        isAll: true,
        sourceRange: toENRELocation(path.node.source.loc, ToENRELocationPolicy.Full),
      }
    );
  } else {
    // TODO: Cannot find the module
  }
};
