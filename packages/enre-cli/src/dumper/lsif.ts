import {eGraph, rGraph} from '@enre/container';
import {preferences} from '@enre/core';
import {expandENRELocation} from '@enre/location';
import fs from 'node:fs/promises';
import path from 'node:path';

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
  const result: object[] = [];

  /**
   * Convenient function to create a LSIF object
   *
   * Return object instead of line-JSON to allow
   * flexible addition.
   */
  function registerEntry(
    type: 'vertex' | 'edge',
    label: 'metaData' | 'source' | 'capabilities' | '$event' | /* TODO */ 'project' | 'document' | 'resultSet' | 'range' | 'hoverResult' | 'definitionResult' | 'referenceResult'
      | 'contains' | 'next' | 'item' | 'textDocument/hover' | 'textDocument/definition' | 'textDocument/references',
    extra: object
  ) {
    const id = counter.next;

    return {
      id,
      type,
      label,
      ...extra,
    };
  }

  result.push(registerEntry('vertex', 'metaData', {version: '0.6.0-next.7', positionEncoding: 'utf-16'}));
  result.push(registerEntry('vertex', 'source', {workspaceRoot: toQualifiedWorkspaceRoot(opts.input)}));
  result.push(registerEntry('vertex', 'capabilities', {
    hoverProvider: true,
    declarationProvider: false,
    definitionProvider: true,
    typeDefinitionProvider: false,
    referencesProvider: true,
    documentSymbolProvider: false,
    /* Folding range is unsupported by ENRE */
    foldingRangeProvider: false,
    diagnosticProvider: false,
  }));

  const idMap = new Map();

  /**
   * For all file entities, create corresponding document object first.
   */
  for (const fileEntity of eGraph.where({type: 'file'})) {
    const fileEntry = registerEntry('vertex', 'document', {
      uri: 'file://' + fileEntity.fullname,
      languageId: 'typescript',
      // This could be removed if we no longer use that vscode extension (which requires base64 encoded content to display the document text)
      contents: (await fs.readFile(fileEntity.fullname, 'base64')),
    });

    // Setup a container for all ranges within this document
    idMap.set(fileEntity.id, {id: fileEntry.id, contains: []});
    result.push(fileEntry);

    const ranges: number[] = idMap.get(fileEntity.id).contains;

    /**
     * Visit other entities, visit the entity tree recursively to
     * gather (def) ranges and create corrsponding result set (for later
     * ref ranges).
     */
    const pending = [...fileEntity.children];
    while (pending.length !== 0) {
      for (const child of pending[0].children || []) {
        pending.push(child);
      }

      const handling = pending[0];
      const qualifiedLocation = expandENRELocation(handling);

      const defRange = registerEntry('vertex', 'range', {
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

      ranges.push(defRange.id);
      result.push(defRange);

      const hoverInfo = registerEntry('vertex', 'hoverResult', {
        result: {
          contents: [
            // TODO: Register corresponding toHoverString method for rich info display
            {language: 'typescript', value: `(${handling.type}) ${handling.name.codeName}`},
            // { language: 'plaintext', value: 'Some custom contents...' }
          ]
        }
      });

      result.push(hoverInfo);

      idMap.set(handling.id, {
        defIds: [defRange.id],
        refIds: [],
        hoverId: hoverInfo.id,
      });

      pending.shift();
    }
  }

  /**
   * Extract ranges from relations, and save them into idMap (cache).
   *
   * This pass only produce and save LSIF ranges (categoried by usage),
   * not creating any edge.
   */
  for (const relation of rGraph.all) {
    /**
     * General relations
     */
    if (['call', 'export', 'extend', 'implement', 'modify', 'set', 'type', 'use'].indexOf(relation.type) !== -1) {
      // if (relation.type !== 'set' || relation.isInit !== true) {
      if (true) {
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

        result.push(refRange);
        if (relation.from.type === 'file') {
          idMap.get(relation.from.id).contains.push(refRange.id);
        } else {
          idMap.get(relation.from.sourceFile.id).contains.push(refRange.id);
        }
        idMap.get(relation.to.id).refIds.push(refRange.id);
      }
      /**
       * Specifically omit new range for Relation: Set
       * if init=true, and reuse entity's range.
       */
      else {
        // ???
      }
    }
    /**
     * Relation: Export
     *
     * Specifically handles alias, and reexports
     */
    else if (relation.type === 'export') {
      // Remove from general relations
    }
    /**
     * Relation: Import
     *
     * Specifically handles alias
     */
    else if (relation.type === 'import') {
      const refRange = registerEntry('vertex', 'range', {
        start: {
          line: relation.location.start.line - 1,
          column: relation.location.start.column - 1,
        },
        end: {
          line: relation.location.start.line - 1,
          // FIXME: Determine correct symbol length
          // @ts-ignore
          column: relation.location.start.column - 1 + (relation.alias?.length ?? 0),
        },
      });

      result.push(refRange);
      if (relation.from.type === 'file') {
        idMap.get(relation.from.id).contains.push(refRange.id);
      } else {
        idMap.get(relation.from.sourceFile.id).contains.push(refRange.id);
      }
      idMap.get(relation.to.id).refIds.push(refRange.id);
    }
  }

  /**
   * For all entities, traverse again to finally generate range-correlated things.
   *
   * For file entity, generate document-contains-ranges edge;
   * for other entities, generate result set to group def ranges and ref ranges.
   */
  for (const entity of eGraph.all) {
    //@ts-ignore
    if (entity.type === 'package') {
      // TODO: After extracting package entity, update this.
    } else if (entity.type === 'file') {
      const fileEntry = idMap.get(entity.id);
      result.push(registerEntry('edge', 'contains', {outV: fileEntry.id, inVs: fileEntry.contains}));
    } else {
      const cache = idMap.get(entity.id);

      if (!cache) {
        continue;
      }

      const resultSet = registerEntry('vertex', 'resultSet', {});
      result.push(resultSet);

      const definitionResult = registerEntry('vertex', 'definitionResult', {});
      // TODO: Create only if refIds is not empty
      const referenceResult = registerEntry('vertex', 'referenceResult', {});
      result.push(definitionResult);
      result.push(referenceResult);
      result.push(registerEntry('edge', 'textDocument/definition', {outV: resultSet.id, inV: definitionResult.id}));
      result.push(registerEntry('edge', 'textDocument/references', {outV: resultSet.id, inV: referenceResult.id}));

      for (const defId of cache.defIds) {
        result.push(registerEntry('edge', 'next', {outV: defId, inV: resultSet.id}));
        // TODO: Support `shard` property of `item` edge, which represents the document (probably?)
        result.push(registerEntry('edge', 'item', {outV: definitionResult.id, inV: defId}));
      }
      result.push(registerEntry('edge', 'item', {
        outV: referenceResult.id,
        inVs: cache.defIds,
        property: 'definitions'
      }));

      for (const refId of cache.refIds) {
        result.push(registerEntry('edge', 'next', {outV: refId, inV: resultSet.id}));
      }
      result.push(registerEntry('edge', 'item', {
        outV: referenceResult.id,
        inVs: cache.refIds,
        property: 'references'
      }));

      result.push(registerEntry('edge', 'textDocument/hover', {outV: resultSet.id, inV: cache.hoverId}));
    }
  }

  fs.writeFile(opts.output, result.map(obj => JSON.stringify(obj)).join('\r\n'));
}
