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
  ENREEntityFile,
  ENREEntityPackage,
  ENREEntityUnknown,
  ENRELogEntry,
  ENRERelationImport,
  pseudoR,
  recordEntityAlias,
  recordRelationImport,
  recordThirdPartyEntityUnknown
} from '@enre-ts/data';
import {toENRELocation, ToENRELocationPolicy} from '@enre-ts/location';
import {ENREContext} from '../context';
import moduleResolver from '../module-resolver';
import {getAliasEnt} from './ExportNamedDeclaration';
import ENREName from '@enre-ts/naming';

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
          if (resolvedModule.id >= 0) {
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
              ) as ENREEntityAlias<ENRERelationImport>,
              kind: symbolRole,
            });
          } else {
            // If the unknown default export was already recorded,
            let unknownDefaultExport = (resolvedModule.children as ENREEntityUnknown[]).find(i => i.role === 'default-export');
            // If not.
            if (!unknownDefaultExport) {
              unknownDefaultExport = recordThirdPartyEntityUnknown(
                new ENREName('Unk'),
                resolvedModule as ENREEntityPackage,
                'default-export',
              );
            }

            recordRelationImport(
              lastScope,
              unknownDefaultExport,
              toENRELocation(sp.loc),
              {
                kind: 'any',
                sourceRange: toENRELocation(path.node.source.loc, ToENRELocationPolicy.Full),
                alias: recordEntityAlias(
                  new ENREName('Norm', sp.local.name),
                  toENRELocation(sp.local.loc),
                  lastScope,
                ) as ENREEntityAlias<ENRERelationImport>,
              },
            );
          }
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
              ) as ENREEntityAlias<ENRERelationImport>,
            },
          );
        } else if (sp.type === 'ImportSpecifier') {
          const isImportDefault = (sp.imported.type === 'StringLiteral' ? sp.imported.value : sp.imported.name) === 'default';
          const alias = getAliasEnt(sp, lastScope) as ENREEntityAlias<ENRERelationImport>;

          if (resolvedModule.id >= 0) {
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
                  at: resolvedModule as ENREEntityFile,
                  exportsOnly: true,
                },
              location: toENRELocation(sp.imported.loc),
              sourceRange: toENRELocation(path.node.loc, ToENRELocationPolicy.Full),
              kind: symbolRole,
              alias,
            });
          } else {
            if (isImportDefault) {
              // If the unknown default export was already recorded,
              let unknownDefaultExport = (resolvedModule.children as ENREEntityUnknown[]).find(i => i.role === 'default-export');
              // If not.
              if (!unknownDefaultExport) {
                unknownDefaultExport = recordThirdPartyEntityUnknown(
                  new ENREName('Unk'),
                  resolvedModule as ENREEntityPackage,
                  'default-export',
                );
              }

              recordRelationImport(
                lastScope,
                unknownDefaultExport,
                toENRELocation(sp.loc),
                {
                  kind: 'any',
                  sourceRange: toENRELocation(path.node.loc, ToENRELocationPolicy.Full),
                  alias,
                },
              );
            } else {
              recordRelationImport(
                lastScope,
                recordThirdPartyEntityUnknown(
                  sp.imported.type === 'StringLiteral' ? new ENREName('Str', sp.imported.value) : new ENREName('Norm', sp.imported.name),
                  resolvedModule as ENREEntityPackage,
                  'normal',
                ),
                toENRELocation(sp.loc),
                {
                  kind: 'any',
                  sourceRange: toENRELocation(path.node.loc, ToENRELocationPolicy.Full),
                  alias,
                },
              );
            }
          }
        }
      }
    }
  }
};
