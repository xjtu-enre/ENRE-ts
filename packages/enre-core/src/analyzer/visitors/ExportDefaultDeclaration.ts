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
import {ENRELogEntry, ENRERelationExport, pseudoR} from '@enre-ts/data';
import {toENRELocation, ToENRELocationPolicy} from '@enre-ts/location';
import {ENREContext} from '../context';
import {ModifierType} from '../context/modifier';

type PathType = NodePath<ExportDefaultDeclaration>

export default (path: PathType, {file: {logs}, scope, modifiers}: ENREContext) => {
  const lastScope = scope.last();

  if (lastScope.type !== 'file') {
    logs.add(path.node.loc!.start.line, ENRELogEntry['An export declaration can only be used at the top level of a module']);
    return;
  }

  const type = path.node.declaration.type;

  if ([
    'FunctionDeclaration',
    'ClassDeclaration',
    'TSInterfaceDeclaration'
  ].includes(type)) {
    const key = `${path.node.loc!.start.line}:${path.node.loc!.start.column}`;
    const validRange = [];

    // Named entity
    if ('id' in path.node.declaration && path.node.declaration.id) {
      validRange.push(toENRELocation(path.node.declaration.id!.loc, ToENRELocationPolicy.Full));
    }
    /**
     * Anonymous entity
     *                Entity location
     *                V
     * export default class {
     *                ^-----^
     *                Use this as valid range
     */
    else {
      if ('body' in path.node.declaration) {
        validRange.push({
          start: {
            line: path.node.declaration.loc!.start.line,
            column: path.node.declaration.loc!.start.column,
          },
          end: {
            line: path.node.declaration.body!.loc!.start!.line,
            column: path.node.declaration.body!.loc!.start!.column,
          }
        });
      }
    }
    modifiers.set(key, {
      type: ModifierType.export,
      proposer: lastScope,
      validRange,
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
