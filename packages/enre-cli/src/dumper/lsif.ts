import fs from 'node:fs/promises';
import path from 'node:path';
import { preferences } from '@enre/core';
import { eGraph, rGraph } from '@enre/container';
import { expandENRELocation } from '@enre/location';

function startIdCounter(base = 1) {
  return {
    get next() {
      // eslint-disable-next-line no-plusplus
      return base++;
    }
  };
}

function toQualifiedWorkspaceRoot(raw: string) {
  let p = path.normalize(raw);

  if (!path.isAbsolute(p)) {
    p = path.join(preferences.get('info.base-path'), p);
  }

  return 'file://' + p;
}

export default async function (opts: any) {
  const counter = startIdCounter();
  const result: string[] = [];

  function registerEntry(
    type: 'vertex' | 'edge',
    label: 'metaData' | 'source' | 'capabilities' | '$event' | /* TODO */ 'project' | 'document' | /* TODO */ 'resultSet' | 'range' | 'hoverResult' | 'definitionResult'
      | 'contains' | 'item' | 'textDocument/hover' | 'textDocument/definition',
    extra: object
  ) {
    const id = counter.next;

    return {
      id,
      content: JSON.stringify({
        id,
        type,
        label,
        ...extra,
      })
    };
  }

  result.push(registerEntry('vertex', 'metaData', { version: '0.6.0-next.7', positionEncoding: 'utf-16' }).content);
  result.push(registerEntry('vertex', 'source', { workspaceRoot: toQualifiedWorkspaceRoot(opts.input) }).content);
  result.push(registerEntry('vertex', 'capabilities', {
    hoverProvider: true,
    declarationProvider: false,
    definitionProvider: true,
    typeDefinitionProvider: true,
    referencesProvider: true,
    documentSymbolProvider: true,
    /* Folding range is unsupported by ENRE */
    foldingRangeProvider: false,
    diagnosticProvider: true,
  }).content);

  const idMap = new Map();

  for (const fileEntity of eGraph.where({ type: 'file' })) {
    const fileEntry = registerEntry('vertex', 'document', {
      uri: 'file://' + fileEntity.fullname,
      languageId: 'typescript',
      // This could be removed if we no longer use that vscode extension (which requires this to display the document text)
      contents: (await fs.readFile(fileEntity.fullname, 'base64')),
    });

    idMap.set(fileEntity.id, { id: fileEntry.id, contains: [] });
    result.push(fileEntry.content);

    const ranges: number[] = idMap.get(fileEntity.id).contains;

    // Visit entity tree recursively instead of flat entity container
    const pending = [fileEntity];
    while (pending.length !== 0) {
      for (const child of pending[0].children || []) {
        if (child.children.length !== 0) {
          pending.push(child);
        }
        const qualifiedLocation = expandENRELocation(child);

        const childRange = registerEntry('vertex', 'range', {
          start: {
            line: qualifiedLocation.start.line - 1,
            character: qualifiedLocation.start.column - 1,
          },
          end: {
            line: qualifiedLocation.end.line - 1,
            character: qualifiedLocation.end.column - 1,
          },
          /* TODO: tag */
        });

        ranges.push(childRange.id);
        result.push(childRange.content);
        idMap.set(child.id, childRange.id);

        const childHover = registerEntry('vertex', 'hoverResult', {
          result: {
            contents: [
              { language: 'typescript', value: `(${child.type}) ${child.name.codeName}` },
              { language: 'plaintext', value: 'Some custom contents...' }
            ]
          }
        });

        result.push(childHover.content);
        result.push(registerEntry('edge', 'textDocument/hover', { outV: childRange.id, inV: childHover.id }).content);

        pending.shift();
      }
    }
  }

  for (const relation of rGraph.all) {
    if (relation.type === 'implement') {
      const refRange = registerEntry('vertex', 'range', {
        start: {
          line: relation.location.start.line - 1,
          column: relation.location.start.column - 1,
        },
        end: {
          line: relation.location.start.line - 1,
          column: relation.location.start.column - 1 + relation.to.name.codeLength,
        },
      });

      result.push(refRange.content);
      //@ts-ignore
      idMap.get(relation.from.sourceFile.id).contains.push(refRange.id);

      const definitionResult = registerEntry('vertex', 'definitionResult', {});
      const definitionEdge = registerEntry('edge', 'textDocument/definition', { outV: refRange.id, inV: definitionResult.id });
      result.push(definitionResult.content);
      result.push(definitionEdge.content);

      // What role does `shard` play? Is it necessary? (no?)
      result.push(registerEntry('edge', 'item', { outV: definitionResult.id, inVs: [idMap.get(relation.to.id)] }).content);
    }
  }

  for (const fileEntity of eGraph.where({ type: 'file' })) {
    const fileEntry = idMap.get(fileEntity.id);
    result.push(registerEntry('edge', 'contains', { outV: fileEntry.id, inVs: fileEntry.contains }).content);
  }

  fs.writeFile(path.resolve(opts.output, 'output.lsif'), result.join('\r\n'));
}
