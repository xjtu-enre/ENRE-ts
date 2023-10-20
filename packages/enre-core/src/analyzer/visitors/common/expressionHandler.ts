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
import {ENREEntityCollectionInFile, postponedTask} from '@enre/data';
import {ENRELocation, toENRELocation, ToENRELocationPolicy} from '@enre/location';
import {ENREContext} from '../../context';

interface CustomHandlers {
  last?: (entity: ENREEntityCollectionInFile, loc: ENRELocation) => void;
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
              operand0: currNode.callee.name,
              location: toENRELocation(currNode.callee.loc)
            });
            currNode = undefined;
            break;

          case 'Super':
            tokenStream.push({
              operation: 'call',
              operand0: 'super',
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
                operand0: propName,
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
            operand0: propName,
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
            operand0: currNode.callee.name,
            location: toENRELocation(currNode.callee.loc)
          });
        }
        currNode = undefined;
        break;
      }

      case 'Identifier': {
        tokenStream.push({
          operation: 'accessObj',
          operand0: currNode.name,
          location: toENRELocation(currNode.loc)
        });
        currNode = undefined;
        break;
      }

      default:
        currNode = undefined;
    }
  }

  /**
   * The resolve of token stream is postponed to the linker.
   */
  postponedTask.add({
    type: 'stream',
    payload: tokenStream,
    scope: from,
  });
};
