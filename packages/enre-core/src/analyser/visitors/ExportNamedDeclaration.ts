/**
 * ExportNamedDeclaration
 *
 * Extracted entities:
 *   * N/A
 *
 * Extracted relations:
 *   * export
 */

import {NodePath} from '@babel/traverse';
import {ExportNamedDeclaration, SourceLocation} from '@babel/types';
import {pseudoR} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {warn} from '@enre/logging';
import {ENREContext} from '../context';
import {CommandLifeCycleKind, CommandType} from '../context/commandStack';
import moduleResolver from '../module-resolver';

export default ({scope, cs}: ENREContext) => {
  return (path: NodePath<ExportNamedDeclaration>) => {
    if (scope.last().type !== 'file') {
      warn('ESError: An export declaration can only be used at the top level of a module.');
      return;
    }

    // Reexports
    if (path.node.source) {
      const resolvedModule = moduleResolver(scope.last(), path.node.source.value);
      if (resolvedModule) {
        if (path.node.specifiers.length === 0) {
          // TODO: Figure out if this is also side-effects-only
        } else {
          for (const sp of path.node.specifiers) {
            if (sp.type === 'ExportSpecifier') {
              // Export as this module's default export
              if ((sp.exported.type === 'StringLiteral' ? sp.exported.value : sp.exported.name) === 'default') {
                pseudoR.add({
                  type: 'export',
                  from: scope.last(),
                  to: sp.local.name === 'default' ? {role: 'export-default'} : {
                    role: 'all',
                    identifier: sp.local.name,
                    noImport: true
                  },
                  location: toENRELocation(sp.local.loc as SourceLocation),
                  at: resolvedModule,
                  // @ts-ignore
                  isDefault: true,
                });
              } else {
                pseudoR.add({
                  type: 'export',
                  from: scope.last(),
                  to: sp.local.name === 'default' ? {role: 'export-default'} : {
                    role: 'all',
                    identifier: sp.local.name,
                    noImport: true
                  },
                  location: toENRELocation(sp.local.loc as SourceLocation),
                  at: resolvedModule,
                  // @ts-ignore
                  alias: sp.exported.start === sp.local.start ? undefined : (sp.exported.type === 'StringLiteral' ? sp.exported.value : sp.exported.name),
                });
              }
            } else {
              // ExportDefaultSpecifier and ExportNamespaceSpecifier shouldn't be here
            }
          }
        }
      }
    } else {
      for (const sp of path.node.specifiers) {
        if (sp.type === 'ExportSpecifier') {
          pseudoR.add({
            type: 'export',
            from: scope.last(),
            to: {role: sp.exportKind === 'value' ? 'all' : 'type', identifier: sp.local.name, noImport: true},
            location: toENRELocation(sp.exported.loc as SourceLocation),
            at: scope.last(),
            // @ts-ignore
            kind: sp.exportKind || 'value',
            alias: sp.exported.type === 'StringLiteral' ? sp.exported.value : sp.exported.name,
          });
        }
      }

      if (path.node.declaration) {
        /**
         * VariableDeclaration may produce multiple entities,
         * and they should all be exported.
         */
        if (path.node.declaration.type === 'VariableDeclaration') {
          cs.push({
            cmd: CommandType.export,
            proposer: scope.last(),
            // The pop of this is handled in the exit action of VariableDeclaration node
            lifeCycle: CommandLifeCycleKind.onCondition,
            isDefault: false,
          });
        } else {
          cs.push({
            cmd: CommandType.export,
            proposer: scope.last(),
            lifeCycle: CommandLifeCycleKind.disposable,
            isDefault: false,
          });
        }
      }
    }
  };
};
