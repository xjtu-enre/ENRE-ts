/**
 * ExportNamedDeclaration
 *
 * Extracted entities:
 *   * Alias
 *
 * Extracted relations:
 *   * Export
 *   - AliasOf (will not be bound until the corresponding export relation is successfully bound)
 */

import {NodePath} from '@babel/traverse';
import {ExportNamedDeclaration, ExportNamespaceSpecifier, ExportSpecifier, ImportSpecifier} from '@babel/types';
import {
  ENREEntityAlias,
  ENREEntityFile,
  ENREEntityNamespace,
  ENRELogEntry,
  ENRERelationExport,
  id,
  pseudoR,
  recordEntityAlias,
  recordRelationExport
} from '@enre/data';
import {toENRELocation, ToENRELocationPolicy} from '@enre/location';
import {ENREContext} from '../context';
import {ModifierType} from '../context/modifier';
import moduleResolver from '../module-resolver';
import ENREName from '@enre/naming';

type PathType = NodePath<ExportNamedDeclaration>

// Alias entity should be added to container in the relation resolving phase.
export const getAliasEnt = (sp: ExportSpecifier | ExportNamespaceSpecifier | ImportSpecifier, scope: id<ENREEntityFile>) => {
  if ((sp.type === 'ExportSpecifier' && sp.local.start !== sp.exported.start) || sp.type === 'ExportNamespaceSpecifier') {
    let name;
    if (sp.exported.type === 'StringLiteral') {
      name = new ENREName<'Str'>('Str', sp.exported.value);
    } else {
      name = new ENREName('Norm', sp.exported.name);
    }

    return recordEntityAlias(
      name,
      toENRELocation(sp.exported.loc),
      scope,
    );
  } else if (sp.type === 'ImportSpecifier' && sp.local.start !== sp.imported.start) {
    return recordEntityAlias(
      new ENREName('Norm', sp.local.name),
      toENRELocation(sp.local.loc),
      scope,
    );
  } else {
    return undefined;
  }
};

export default {
  enter: (path: PathType, {file: {logs}, scope, modifiers}: ENREContext) => {
    const lastScope = scope.last();

    if (!['file', 'namespace'].includes(lastScope.type)) {
      logs.add(path.node.loc!.start.line, ENRELogEntry['An export declaration can only be used at the top level of a module']);
      return;
    }

    const symbolRole = path.node.exportKind === 'type' ? 'type' : 'any';

    // Reexports
    if (path.node.source) {
      const resolvedModule = moduleResolver(lastScope as ENREEntityFile, path.node.source.value) as id<ENREEntityFile>;
      if (resolvedModule) {
        const sps = path.node.specifiers;

        if (sps.length === 0) {
          /**
           * This corresponds to `export {} from 'mod'`, which behaves to what like a side effect import.
           * However, TypeScript removes this declaration, which is different to ECMAScript.
           * Maybe we should report this as an issue?
           *
           * TODO: Report this as issue and throw warning
           */
          recordRelationExport(
            lastScope as id<ENREEntityFile>,
            resolvedModule,
            toENRELocation(path.node.loc),
            {
              kind: symbolRole,
              isDefault: false,
              isAll: false,
              sourceRange: toENRELocation(path.node.source.loc, ToENRELocationPolicy.Full),
            },
          );
        } else {
          if (
            sps.filter(sp => sp.type === 'ExportSpecifier').length !== 0 &&
            sps.filter(sp => sp.type !== 'ExportSpecifier').length !== 0) {
            /**
             * This corresponds to `export * as x, {a as b} from 'mod'`,
             * which is an invalid yet parsed syntax.
             *
             * Update: babel has fixed this.
             */
            // TODO: Throw warning?
          }

          for (const sp of sps) {
            if (sp.type === 'ExportSpecifier') {
              // @ts-ignore The type of local node of an ExportSpecifier can be StringLiteral
              const isImportDefault = (sp.local.type === 'StringLiteral' ? sp.local.value : sp.local.name) === 'default';
              const isExportDefault = (sp.exported.type === 'StringLiteral' ? sp.exported.value : sp.exported.name) === 'default';
              // Judging if there are multiple default export will be postponed to binding phase.

              const alias = getAliasEnt(sp, lastScope as id<ENREEntityFile>) as id<ENREEntityAlias<ENRERelationExport>>;

              pseudoR.add<ENRERelationExport>({
                type: 'export',
                from: lastScope,
                to: isImportDefault ?
                  {
                    role: 'default-export',
                    at: resolvedModule,
                  } :
                  {
                    role: 'any',
                    // @ts-ignore
                    identifier: sp.local.type === 'StringLiteral' ? sp.local.value : sp.local.name,
                    at: resolvedModule,
                    localOnly: true,
                  },
                location: toENRELocation(sp.local.loc),
                sourceRange: toENRELocation(path.node.source.loc, ToENRELocationPolicy.Full),
                isDefault: isExportDefault,
                isAll: false,
                kind: symbolRole,
                alias,
              });
            } else if (sp.type === 'ExportNamespaceSpecifier') {
              // @ts-ignore
              const isDefault = (sp.exported.type === 'StringLiteral' ? sp.exported.value : sp.exported.name) === 'default';
              const alias = getAliasEnt(sp, lastScope as id<ENREEntityFile>)! as id<ENREEntityAlias<ENRERelationExport>>;

              recordRelationExport(
                lastScope as id<ENREEntityFile>,
                resolvedModule,
                toENRELocation(sp.loc),
                {
                  kind: symbolRole,
                  isDefault,
                  isAll: true,
                  sourceRange: toENRELocation(path.node.source.loc, ToENRELocationPolicy.Full),
                  alias,
                },
              );
            } else if (sp.type === 'ExportDefaultSpecifier') {
              // Impossible syntax
            }
          }
        }
      } else {
        // TODO: Cannot find the module
      }
    }
    // Regular export
    else {
      for (const sp of path.node.specifiers) {
        if (sp.type === 'ExportSpecifier') {
          const alias = getAliasEnt(sp, lastScope as id<ENREEntityFile>) as id<ENREEntityAlias<ENRERelationExport>>;

          pseudoR.add<ENRERelationExport>({
            type: 'export',
            from: lastScope,
            to: {
              role: 'any',
              identifier: sp.local.name,
              at: lastScope,
            },
            location: toENRELocation(sp.local.loc),
            kind: symbolRole,
            isDefault: false,
            isAll: false,
            alias,
          });
        } else {
          // Impossible syntax
        }
      }

      if (path.node.declaration) {
        const key = `${path.node.loc!.start.line}:${path.node.loc!.start.column}`;
        const validRange = [];
        /**
         * VariableDeclaration may produce multiple entities,
         * and they should all be exported.
         */
        if (path.node.declaration.type === 'VariableDeclaration') {
          for (const decl of path.node.declaration.declarations) {
            validRange.push(toENRELocation(decl.id.loc, ToENRELocationPolicy.Full));
          }
        } else if ('id' in path.node.declaration) {
          validRange.push(toENRELocation(path.node.declaration.id!.loc, ToENRELocationPolicy.Full));
        }

        modifiers.set(key, {
          type: ModifierType.export,
          proposer: lastScope as id<ENREEntityFile> | id<ENREEntityNamespace>,
          validRange,
          isDefault: false,
        });
      }
    }
  },

  exit: (path: PathType, {modifiers}: ENREContext) => {
    if (path.node.declaration) {
      const key = `${path.node.loc!.start.line}:${path.node.loc!.start.column}`;
      modifiers.delete(key);
    }
  }
};
