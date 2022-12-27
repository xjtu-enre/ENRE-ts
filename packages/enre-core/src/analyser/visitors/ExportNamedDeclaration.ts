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
import {ExportNamedDeclaration} from '@babel/types';
import {pseudoR} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {warn} from '@enre/logging';
import {ENREContext} from '../context';
import {ModifierLifeCycleKind, ModifierType} from '../context/modifier-stack';
import moduleResolver from '../module-resolver';
import {ENREi18nen_US} from '../../i18n/en_US/js-compiling';
import {lastOf} from '../context/scope';

export default ({scope, modifier}: ENREContext) => {
  return (path: NodePath<ExportNamedDeclaration>) => {
    const lastScope = lastOf(scope);

    if (lastScope.type !== 'file') {
      warn(ENREi18nen_US['An export declaration can only be used at the top level of a module']);
      return;
    }

    // Reexports
    if (path.node.source) {
      const resolvedModule = moduleResolver(lastScope, path.node.source.value);
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
                  from: lastScope,
                  to: sp.local.name === 'default' ? {role: 'default-export'} : {
                    role: 'all',
                    identifier: sp.local.name,
                    localOnly: true
                  },
                  location: toENRELocation(sp.local.loc),
                  at: resolvedModule,
                  // @ts-ignore
                  isDefault: true,
                });
              } else {
                pseudoR.add({
                  type: 'export',
                  from: lastScope,
                  to: sp.local.name === 'default' ? {role: 'default-export'} : {
                    role: 'all',
                    identifier: sp.local.name,
                    localOnly: true
                  },
                  location: toENRELocation(sp.local.loc),
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
            from: lastScope,
            to: {role: sp.exportKind === 'value' ? 'all' : 'type', identifier: sp.local.name, localOnly: true},
            location: toENRELocation(sp.exported.loc),
            at: lastScope,
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
};
