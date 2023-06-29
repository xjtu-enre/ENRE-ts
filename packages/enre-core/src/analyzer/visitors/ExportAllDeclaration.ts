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
import moduleResolver from '../module-resolver';
import {ENRELogEntry, recordRelationExport, rGraph} from '@enre/data';
import {toENRELocation, ToENRELocationPolicy} from '@enre/location';

type PathType = NodePath<ExportAllDeclaration>

export default (path: PathType, {file: {logs}, scope}: ENREContext) => {
  const lastScope = scope.last();

  if (lastScope.type !== 'file') {
    logs.add(path.node.loc!.start.line, ENRELogEntry['An export declaration can only be used at the top level of a module']);
    return;
  }

  const symbolRole = path.node.exportKind === 'type' ? 'type' : 'any';

  const resolvedModule = moduleResolver(lastScope, path.node.source.value);
  if (resolvedModule) {
    rGraph.add(recordRelationExport(
      lastScope,
      resolvedModule,
      toENRELocation(path.node.loc),
      {
        kind: symbolRole,
        isDefault: false,
        isAll: true,
        sourceRange: toENRELocation(path.node.source.loc, ToENRELocationPolicy.Full),
      }
    ));
  } else {
    // TODO: Cannot find the module
  }
};
