/**
 * ImportDeclaration
 *
 * Extracted relations:
 *   * Import
 */

import {NodePath} from '@babel/traverse';
import {ImportDeclaration} from '@babel/types';
import {
  ENREEntityAlias,
  ENRELogEntry,
  ENRERelationImport,
  pseudoR,
  recordEntityAlias,
  recordRelationImport
} from '@enre/data';
import {toENRELocation, ToENRELocationPolicy} from '@enre/location';
import {ENREContext} from '../context';
import moduleResolver from '../module-resolver';
import {getAliasEnt} from './ExportNamedDeclaration';
import ENREName from '@enre/naming';

type PathType = NodePath<ImportDeclaration>

export default (path: PathType, {file: {logs}, scope}: ENREContext) => {
  const lastScope = scope.last();

  if (lastScope.type !== 'file') {
    logs.add(path.node.loc!.start.line, ENRELogEntry['An import declaration can only be used at the top level of a module']);
    return;
  }

  // TODO: Investigate 'typeof' importKind
  const symbolRole = path.node.importKind === 'type' ? 'type' : 'any';

  const resolvedModule = moduleResolver(lastScope, path.node.source.value);
  if (resolvedModule) {
    // Side-effect-only import
    if (path.node.specifiers.length === 0) {
      recordRelationImport(
        lastScope,
        resolvedModule,
        toENRELocation(path.node.loc),
        {
          kind: symbolRole,
          sourceRange: toENRELocation(path.node.source.loc, ToENRELocationPolicy.Full),
        },
      );
    } else {
      for (const sp of path.node.specifiers) {
        if (sp.type === 'ImportDefaultSpecifier') {
          pseudoR.add<ENRERelationImport>({
            type: 'import',
            from: lastScope,
            to: {role: 'default-export', at: resolvedModule},
            location: toENRELocation(sp.local.loc),
            sourceRange: toENRELocation(path.node.source.loc, ToENRELocationPolicy.Full),
            alias: recordEntityAlias(
              new ENREName('Norm', sp.local.name),
              toENRELocation(sp.local.loc),
              lastScope,
            ),
            kind: symbolRole,
          });
        } else if (sp.type === 'ImportNamespaceSpecifier') {
          recordRelationImport(
            lastScope,
            resolvedModule,
            toENRELocation(sp.loc),
            {
              kind: symbolRole,
              sourceRange: toENRELocation(path.node.source.loc, ToENRELocationPolicy.Full),
              alias: recordEntityAlias(
                new ENREName('Norm', sp.local.name),
                toENRELocation(sp.local.loc),
                lastScope,
              ),
            },
          );
        } else if (sp.type === 'ImportSpecifier') {
          const isImportDefault = (sp.imported.type === 'StringLiteral' ? sp.imported.value : sp.imported.name) === 'default';

          const alias = getAliasEnt(sp, lastScope) as ENREEntityAlias<ENRERelationImport>;

          pseudoR.add<ENRERelationImport>({
            type: 'import',
            from: lastScope,
            to: isImportDefault ?
              {
                role: 'default-export',
                at: resolvedModule,
              } :
              {
                role: 'any',
                identifier: sp.imported.type === 'StringLiteral' ? sp.imported.value : sp.imported.name,
                at: resolvedModule,
                exportsOnly: true,
              },
            location: toENRELocation(sp.imported.loc),
            sourceRange: toENRELocation(path.node.loc, ToENRELocationPolicy.Full),
            kind: symbolRole,
            alias,
          });
        }
      }
    }
  }
};
