import {NodePath} from '@babel/traverse';
import {ImportDeclaration, SourceLocation} from '@babel/types';
import {pseudoR, recordRelationImport} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {warn} from '@enre/logging';
import {ENREContext} from '../context';
import moduleResolver from '../module-resolver';

export default ({scope}: ENREContext) => {
  return (path: NodePath<ImportDeclaration>) => {
    if (scope.last().type !== 'file') {
      warn('ESError: An import declaration can only be used at the top level of a module.');
      return;
    }

    const resolvedModule = moduleResolver(scope.last(), path.node.source.value);
    if (resolvedModule) {
      // Side-effect-only import
      if (path.node.specifiers.length === 0) {
        recordRelationImport(
          scope.last(),
          resolvedModule,
          toENRELocation(path.node.source.loc as SourceLocation),
          {kind: 'value'},
        );
      } else {
        for (const sp of path.node.specifiers) {
          if (sp.type === 'ImportDefaultSpecifier') {
            pseudoR.add({
              type: 'import',
              from: scope.last(),
              to: {role: 'export-default'},
              location: toENRELocation(sp.local.loc as SourceLocation),
              at: resolvedModule,
              // @ts-ignore
              alias: sp.local.name,
            });
          } else if (sp.type === 'ImportNamespaceSpecifier') {
            recordRelationImport(
              scope.last(),
              resolvedModule,
              toENRELocation(sp.local.loc as SourceLocation),
              {kind: 'value', alias: sp.local.name},
            );
          } else if (sp.type === 'ImportSpecifier') {
            pseudoR.add({
              type: 'import',
              from: scope.last(),
              to: (sp.imported.type === 'StringLiteral' ? sp.imported.value : sp.imported.name) === 'default'
                ? {role: 'export-default'}
                : {
                  role: sp.importKind === 'value' ? 'all' : 'type',
                  identifier: sp.imported.type === 'StringLiteral' ? sp.imported.value : sp.imported.name,
                  exportsOnly: true,
                },
              location: toENRELocation(sp.imported.loc as SourceLocation),
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
