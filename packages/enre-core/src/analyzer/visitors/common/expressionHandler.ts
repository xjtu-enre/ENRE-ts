/**
 * (Handler for all) ExpressionStatement
 *
 * This hook does not extract any entity/relation,
 * but only convert AST to token stream (IR) for later use.
 *
 * Extracted entities:
 *   * N/A
 *
 * Extracted relations:
 *   * N/A
 */

import {Expression} from '@babel/types';
import {
  ENREEntityClass,
  ENREEntityCollectionAll,
  ENREEntityCollectionInFile,
  ENREEntityUnknown,
  id,
  recordRelationCall,
  recordRelationUse,
  recordThirdPartyEntityUnknown,
  rGraph
} from '@enre/data';
import {ENRELocation, toENRELocation, ToENRELocationPolicy} from '@enre/location';
import {ENREContext} from '../../context';
import lookup from '../../linker/lookup';
import ENREName from '@enre/naming';

interface CustomHandlers {
  last?: (entity: id<ENREEntityCollectionInFile>, loc: ENRELocation) => void;
}

export default (node: Expression, scope: ENREContext['scope'], handlers?: CustomHandlers) => {
  const from = scope.last();

  // TODO: Type TokenStream
  const tokenStream = [];

  // Convert AST to token stream
  let currNode: Expression | undefined = node;
  while (currNode !== undefined) {
    switch (currNode.type) {
      case 'CallExpression': {
        switch (currNode.callee.type) {
          case 'Identifier':
            tokenStream.push({
              operation: 'call',
              operand: currNode.callee.name,
              location: toENRELocation(currNode.callee.loc)
            });
            currNode = undefined;
            break;

          case 'Super':
            tokenStream.push({
              operation: 'call',
              operand: 'super',
              location: toENRELocation(currNode.callee.loc, ToENRELocationPolicy.PartialEnd)
            });
            currNode = undefined;
            break;

          case 'MemberExpression': {
            const prop = currNode.callee.property;
            let propName: string | undefined = undefined;
            if (prop.type === 'Identifier') {
              propName = prop.name;
            } else if (prop.type === 'StringLiteral') {
              propName = prop.value;
            } else if (prop.type === 'NumericLiteral') {
              propName = prop.value.toString();
            }

            if (propName) {
              tokenStream.push({
                operation: 'call',
                operand: propName,
                location: toENRELocation(currNode.callee.property.loc)
              });
              currNode = currNode.callee.object;
            } else {
              currNode = undefined;
            }
            break;
          }
        }
        break;
      }

      case 'AssignmentExpression': {
        currNode = undefined;
        break;
      }

      case 'MemberExpression': {
        const prop = currNode.property;
        let propName: string | undefined = undefined;
        if (prop.type === 'Identifier') {
          propName = prop.name;
        } else if (prop.type === 'StringLiteral') {
          propName = prop.value;
        } else if (prop.type === 'NumericLiteral') {
          propName = prop.value.toString();
        }

        if (propName) {
          tokenStream.push({
            operation: 'accessProp',
            operand: propName,
            location: toENRELocation(currNode.property.loc)
          });
          currNode = currNode.object;
        } else {
          currNode = undefined;
        }
        break;
      }

      case 'NewExpression': {
        if (currNode.callee.type === 'Identifier') {
          tokenStream.push({
            operation: 'new',
            operand: currNode.callee.name,
            location: toENRELocation(currNode.callee.loc)
          });
        }
        currNode = undefined;
        break;
      }

      case 'Identifier': {
        tokenStream.push({operation: 'accessObj', operand: currNode.name, location: toENRELocation(currNode.loc)});
        currNode = undefined;
        break;
      }

      default:
        currNode = undefined;
    }
  }

  /**
   * Interpret the stream (by reverse enumerating) immediately
   *
   * Since one cannot access uninitialized variable,
   * a simple assumption that all references are properly
   * initialized before is made here.
   */
  let currSymbol: id<ENREEntityCollectionAll> | undefined = undefined;
  for (let i = tokenStream.length - 1; i !== -1; i--) {
    const token = tokenStream[i];
    switch (token.operation) {
      case 'accessObj': {
        const found = lookup({role: 'value', identifier: token.operand, at: from}) as id<ENREEntityCollectionAll>;
        if (found) {
          currSymbol = found;
          recordRelationUse(
            from,
            currSymbol,
            token.location,
          );
        }
        break;
      }

      case 'new': {
        const found = lookup({role: 'value', identifier: token.operand, at: from}) as id<ENREEntityCollectionAll>;
        if (found) {
          currSymbol = found;
          recordRelationCall(
            from,
            currSymbol,
            token.location,
            {isNew: true},
          );
        }
        break;
      }

      case 'call': {
        // A single call expression
        if (currSymbol === undefined) {
          if (token.operand === 'super') {
            const classEntity = from.parent as id<ENREEntityClass>;
            const superclass = rGraph.where({
              from: classEntity,
              type: 'extend',
            })?.[0].to;
            if (superclass) {
              // Extend a user-space class
              if (superclass.id >= 0) {
                // TODO: This should be a postponed binding after superclass is bound.
                recordRelationCall(
                  from,
                  superclass,
                  token.location,
                  {isNew: false},
                );
              }
              // Extend a third-party class
              else {
                recordRelationCall(
                  from,
                  superclass,
                  token.location,
                  {isNew: false},
                );
              }
            }
          }
          // A call to an expression's evaluation result
          else {
            const found = lookup({role: 'value', identifier: token.operand, at: from}) as id<ENREEntityCollectionAll>;
            if (found) {
              currSymbol = found;
              recordRelationCall(
                from,
                found,
                token.location,
                {isNew: false},
              );
            }
          }
        } else {
          let found = undefined;
          for (const child of currSymbol.children) {
            if (child.name.codeName === token.operand) {
              found = child;
            }
          }

          if (found) {
            recordRelationCall(
              from,
              found as id<ENREEntityCollectionAll>,
              token.location,
              {isNew: false},
            );
          }

          // TODO: According to function returning type, update currSymbol
          currSymbol = undefined;
        }
        break;
      }

      case 'accessProp': {
        if (currSymbol) {
          let found = undefined;
          for (const child of currSymbol.children) {
            if (child.name.codeName === token.operand) {
              found = child;
            }
          }

          if (found) {
            recordRelationUse(
              from,
              found as id<ENREEntityCollectionAll>,
              token.location,
            );
          }
          /**
           * If the prop cannot be found, and its parent has a negative id,
           * it's probably a previously unknown third-party prop,
           * in which case, we should record this prop as an unknown entity.
           */
          else if (currSymbol.id < 0 || (currSymbol.type === 'alias' && currSymbol.ofRelation.to.id < 0)) {
            const unknownProp = recordThirdPartyEntityUnknown(
              new ENREName('Norm', token.operand),
              currSymbol as id<ENREEntityUnknown>,
              'normal',
            );
            if (i === 0) {
              handlers?.last?.(unknownProp, token.location);
            }
            currSymbol = unknownProp;
          } else {
            currSymbol = undefined;
          }
        }
        break;
      }
    }
  }
};
