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
import {ENRERelationExport, pseudoR} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {warn} from '@enre/logging';
import {ENREContext} from '../context';
import {ModifierLifeCycleKind, ModifierType} from '../context/modifier-stack';
import {ENREi18nen_US} from '../../i18n/en_US/js-compiling';

type PathType = NodePath<ExportDefaultDeclaration>

export default (path: PathType, {scope, modifier}: ENREContext) => {
  const lastScope = scope.last();

  if (lastScope.type !== 'file') {
    warn(ENREi18nen_US['An export declaration can only be used at the top level of a module']);
    return;
  }

  const type = path.node.declaration.type;

  if ([
    'FunctionDeclaration',
    'ClassDeclaration',
    'TSInterfaceDeclaration'
  ].includes(type)) {
    modifier.push({
      type: ModifierType.export,
      proposer: lastScope,
      lifeCycle: ModifierLifeCycleKind.disposable,
      isDefault: true,
    });
  }
  // See docs/relation/export.md#default-export-identifier-and-assignment-expressions
  else if (type === 'Identifier') {
    pseudoR.add<ENRERelationExport>({
      type: 'export',
      from: lastScope,
      to: {role: 'any', identifier: path.node.declaration.name, at: lastScope},
      location: toENRELocation(path.node.declaration.loc),
      kind: 'any',
      isDefault: true,
      isAll: false,
    });
  } else if (type === 'UpdateExpression') {
    if (path.node.declaration.argument.type === 'Identifier') {
      pseudoR.add<ENRERelationExport>({
        type: 'export',
        from: lastScope,
        to: {role: 'any', identifier: path.node.declaration.argument.name, at: lastScope},
        location: toENRELocation(path.node.declaration.argument.loc),
        kind: 'any',
        isDefault: true,
        isAll: false,
      });
    }
  } else if (type === 'AssignmentExpression') {
    if (path.node.declaration.left.type === 'Identifier') {
      pseudoR.add<ENRERelationExport>({
        type: 'export',
        from: lastScope,
        to: {role: 'any', identifier: path.node.declaration.left.name, at: lastScope},
        location: toENRELocation(path.node.declaration.left.loc),
        kind: 'any',
        isDefault: true,
        isAll: false,
      });
    }
  }
};
