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
  ENREEntityFile,
  ENRERelationExport,
  pseudoR,
  recordEntityAlias,
  recordRelationAliasOf,
  recordRelationExport
} from '@enre/container';
import {toENRELocation, ToENRELocationPolicy} from '@enre/location';
import {warn} from '@enre/logging';
import {ENREContext} from '../context';
import {ModifierLifeCycleKind, ModifierType} from '../context/modifier-stack';
import moduleResolver from '../module-resolver';
import {ENREi18nen_US} from '../../i18n/en_US/js-compiling';
import {buildENREName, ENRENameModified} from '@enre/naming';

type PathType = NodePath<ExportNamedDeclaration>

export const getAliasEnt = (sp: ExportSpecifier | ExportNamespaceSpecifier | ImportSpecifier, scope: ENREEntityFile) => {
  if ((sp.type === 'ExportSpecifier' && sp.local.start !== sp.exported.start) || sp.type === 'ExportNamespaceSpecifier') {
    let name;
    if (sp.exported.type === 'StringLiteral') {
      name = buildENREName<ENRENameModified>({raw: sp.exported.value, as: 'StringLiteral'});
    } else {
      name = buildENREName(sp.exported.name);
    }

    return recordEntityAlias<ENRERelationExport>(
      name,
      toENRELocation(sp.exported.loc),
      scope,
    );
  } else if (sp.type === 'ImportSpecifier' && sp.local.start !== sp.imported.start) {
    return recordEntityAlias<ENRERelationExport>(
      buildENREName(sp.local.name),
      toENRELocation(sp.local.loc),
      scope,
    );
  } else {
    return undefined;
  }
};

export default (path: PathType, {scope, modifier}: ENREContext) => {
  const lastScope = scope.last();

  if (lastScope.type !== 'file') {
    warn(ENREi18nen_US['An export declaration can only be used at the top level of a module']);
    return;
  }

  const symbolRole = path.node.exportKind === 'type' ? 'type' : 'any';

  // Reexports
  if (path.node.source) {
    const resolvedModule = moduleResolver(lastScope, path.node.source.value);
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
          lastScope,
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

            const aliasEnt = getAliasEnt(sp, lastScope);

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
              aliasEnt,
            });
          } else if (sp.type === 'ExportNamespaceSpecifier') {
            // @ts-ignore
            const isDefault = (sp.exported.type === 'StringLiteral' ? sp.exported.value : sp.exported.name) === 'default';
            const aliasEnt = getAliasEnt(sp, lastScope)!;

            const aliasRel = recordRelationAliasOf<ENRERelationExport>(
              aliasEnt,
              resolvedModule,
              aliasEnt.location,
            );

            recordRelationExport(
              lastScope,
              resolvedModule,
              toENRELocation(sp.loc),
              {
                kind: symbolRole,
                isDefault,
                isAll: true,
                sourceRange: toENRELocation(path.node.source.loc, ToENRELocationPolicy.Full),
              },
            ).alias = aliasRel;
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
        const aliasEnt = getAliasEnt(sp, lastScope);

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
          aliasEnt,
        });
      } else {
        // Impossible syntax
      }
    }

    if (path.node.declaration) {
      /**
       * VariableDeclaration may produce multiple entities,
       * and they should all be exported.
       */
      if (path.node.declaration.type === 'VariableDeclaration') {
        modifier.push({
          type: ModifierType.export,
          proposer: lastScope,
          // The pop of this is handled in the exit action of VariableDeclaration node
          lifeCycle: ModifierLifeCycleKind.onCondition,
          isDefault: false,
        });
      } else {
        modifier.push({
          type: ModifierType.export,
          proposer: lastScope,
          lifeCycle: ModifierLifeCycleKind.disposable,
          isDefault: false,
        });
      }
    }
  }
};
