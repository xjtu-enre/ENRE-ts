/**
 * ExportDefaultDeclaration
 *
 * Extracted entities:
 *   * N/A
 *
 * Extracted relations:
 *   * export
 */
import {NodePath} from '@babel/traverse';
import {ExportDefaultDeclaration} from '@babel/types';
import {pseudoR} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {warn} from '@enre/logging';
import {ENREContext} from '../context';
import {ModifierLifeCycleKind, ModifierType} from '../context/modifier-stack';
import {ENREi18nen_US} from '../../i18n/en_US/js-compiling';
import {lastOf} from '../context/scope';

export default ({scope, modifier}: ENREContext) => {
  return (path: NodePath<ExportDefaultDeclaration>) => {
    if (lastOf(scope).type !== 'file') {
      warn(ENREi18nen_US['An export declaration can only be used at the top level of a module']);
      return;
    }

    const type = path.node.declaration.type;

    if (
      [
        'FunctionDeclaration',
        'ClassDeclaration',
        'TSInterfaceDeclaration'
      ].includes(type)) {
      modifier.push({
        type: ModifierType.export,
        proposer: lastOf(scope),
        lifeCycle: ModifierLifeCycleKind.disposable,
        isDefault: true,
      });
    }
    // See docs/relation/export.md#default-export-identifier-and-assignment-expressions
    else if (type === 'Identifier') {
      pseudoR.add({
        type: 'export',
        from: lastOf(scope),
        to: {role: 'all', identifier: path.node.declaration.name},
        location: toENRELocation(path.node.declaration.loc),
        at: lastOf(scope),
        // @ts-ignore
        kind: 'value',
        isDefault: true,
      });
    } else if (type === 'UpdateExpression') {
      if (path.node.declaration.argument.type === 'Identifier') {
        pseudoR.add({
          type: 'export',
          from: lastOf(scope),
          to: {role: 'all', identifier: path.node.declaration.argument.name},
          location: toENRELocation(path.node.declaration.argument.loc),
          at: lastOf(scope),
          // @ts-ignore
          kind: 'value',
          isDefault: true,
        });
      }
    } else if (type === 'AssignmentExpression') {
      if (path.node.declaration.left.type === 'Identifier') {
        pseudoR.add({
          type: 'export',
          from: lastOf(scope),
          to: {role: 'all', identifier: path.node.declaration.left.name},
          location: toENRELocation(path.node.declaration.left.loc),
          at: lastOf(scope),
          // @ts-ignore
          kind: 'value',
          isDefault: true,
        });
      }
    }
  };
};
