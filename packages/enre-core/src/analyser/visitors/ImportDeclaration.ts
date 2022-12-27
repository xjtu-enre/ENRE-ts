import {NodePath} from '@babel/traverse';
import {ImportDeclaration, SourceLocation} from '@babel/types';
import {pseudoR, recordRelationImport} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {warn} from '@enre/logging';
import {ENREContext} from '../context';
import moduleResolver from '../module-resolver';
import {ENREi18nen_US} from '../../i18n/en_US/js-compiling';
import {lastOf} from '../context/scope';

export default ({scope}: ENREContext) => {
  return (path: NodePath<ImportDeclaration>) => {
    if (lastOf(scope).type !== 'file') {
      warn(ENREi18nen_US['An import declaration can only be used at the top level of a module']);
      return;
    }

    const resolvedModule = moduleResolver(lastOf(scope), path.node.source.value);
    if (resolvedModule) {
      // Side-effect-only import
      if (path.node.specifiers.length === 0) {
        recordRelationImport(
          lastOf(scope),
          resolvedModule,
          toENRELocation(path.node.source.loc as SourceLocation),
          {kind: 'value'},
        );
      } else {
        for (const sp of path.node.specifiers) {
          if (sp.type === 'ImportDefaultSpecifier') {
            pseudoR.add({
              type: 'import',
              from: lastOf(scope),
              to: {role: 'default-export'},
              location: toENRELocation(sp.local.loc as SourceLocation),
              at: resolvedModule,
              // @ts-ignore
              alias: sp.local.name,
            });
          } else if (sp.type === 'ImportNamespaceSpecifier') {
            recordRelationImport(
              lastOf(scope),
              resolvedModule,
              toENRELocation(sp.local.loc as SourceLocation),
              {kind: 'value', alias: sp.local.name},
            );
          } else if (sp.type === 'ImportSpecifier') {
            pseudoR.add({
              type: 'import',
              from: lastOf(scope),
              to: (sp.imported.type === 'StringLiteral' ? sp.imported.value : sp.imported.name) === 'default'
                ? {role: 'default-export'}
                : {
                  role: sp.importKind === 'value' ? 'all' : 'type',
                  identifier: sp.imported.type === 'StringLiteral' ? sp.imported.value : sp.imported.name,
                  exportsOnly: true,
                },
              location: toENRELocation(sp.imported.loc),
              at: resolvedModule,
              // @ts-ignore
              alias: sp.local.start === sp.imported.start ? undefined : (sp.local.name === sp.imported.name ? undefined : sp.local.name),
            });
          }
        }
      }
    }
  };
};
