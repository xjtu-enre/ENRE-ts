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
import {ExportDefaultDeclaration, SourceLocation} from '@babel/types';
import {pseudoR} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {warn} from '@enre/logging';
import {ENREContext} from '../context';
import {CommandLifeCycleKind, CommandType} from '../context/commandStack';

export default ({scope, cs}: ENREContext) => {
  return (path: NodePath<ExportDefaultDeclaration>) => {
    if (scope.last().type !== 'file') {
      warn('ESError: An export declaration can only be used at the top level of a module.');
      return;
    }

    const type = path.node.declaration.type;

    if (
      [
        'FunctionDeclaration',
        'ClassDeclaration',
        'TSInterfaceDeclaration'
      ].includes(type)) {
      cs.push({
        cmd: CommandType.export,
        proposer: scope.last(),
        lifeCycle: CommandLifeCycleKind.disposable,
        isDefault: true,
      });
    }
    // See docs/relation/export.md#default-export-identifier-and-assignment-expressions
    else if (type === 'Identifier') {
      pseudoR.add({
        type: 'export',
        from: scope.last(),
        to: {role: 'all', identifier: path.node.declaration.name},
        location: toENRELocation(path.node.declaration.loc as SourceLocation),
        at: scope.last(),
        // @ts-ignore
        kind: 'value',
        isDefault: true,
      });
    } else if (type === 'UpdateExpression') {
      if (path.node.declaration.argument.type === 'Identifier') {
        pseudoR.add({
          type: 'export',
          from: scope.last(),
          to: {role: 'all', identifier: path.node.declaration.argument.name},
          location: toENRELocation(path.node.declaration.argument.loc as SourceLocation),
          at: scope.last(),
          // @ts-ignore
          kind: 'value',
          isDefault: true,
        });
      }
    } else if (type === 'AssignmentExpression') {
      if (path.node.declaration.left.type === 'Identifier') {
        pseudoR.add({
          type: 'export',
          from: scope.last(),
          to: {role: 'all', identifier: path.node.declaration.left.name},
          location: toENRELocation(path.node.declaration.left.loc as SourceLocation),
          at: scope.last(),
          // @ts-ignore
          kind: 'value',
          isDefault: true,
        });
      }
    }
  };
};
