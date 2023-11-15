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

import {
  ArgumentPlaceholder,
  Expression,
  JSXNamespacedName,
  SpreadElement
} from '@babel/types';
import {ENREEntityCollectionInFile, postponedTask} from '@enre/data';
import {ENRELocation, toENRELocation, ToENRELocationPolicy} from '@enre/location';
import {ENREContext} from '../../context';
import resolveJSObj from './literal-handler';

interface CustomHandlers {
  last?: (entity: ENREEntityCollectionInFile, loc: ENRELocation) => void;
}

type ResolvableNodeTypes =
  Expression
  | SpreadElement
  | JSXNamespacedName
  | ArgumentPlaceholder;

export default function resolve(
  node: ResolvableNodeTypes,
  scope: ENREContext['scope'],
  handlers?: CustomHandlers,
) {
  const from = scope.last();

  // TODO: Type TokenStream

  // The stream is in reverse order
  const tokenStream = recursiveTraverse(node, scope, handlers);

  /**
   * The resolve of token stream is postponed to the linker.
   */
  const task = {
    type: 'descend',
    payload: tokenStream,
    scope: from,
    onSuccess: undefined as unknown as (any: any) => void,
  };
  postponedTask.add(task);

  return task;
}

/**
 * Traverse the AST node recursively, generate a token stream, but not create
 * corresponding postponedTask, just return it for callee to merge.
 */
function recursiveTraverse(
  node: ResolvableNodeTypes,
  scope: ENREContext['scope'],
  handlers?: CustomHandlers
) {
  // The token stream is in reverse order
  const tokenStream = [];

  let currNode: ResolvableNodeTypes | undefined = node;
  while (currNode !== undefined) {
    switch (currNode.type) {
      case 'OptionalCallExpression':
      case 'CallExpression': {
        //Resolve callee

        // Resolve arguments of the call expression
        // TODO: Can be JSObj or expression
        const argsRepr = [];

        for (const arg of currNode.arguments) {
          // @ts-ignore
          const objRepr = resolveJSObj(arg);
          if (objRepr !== undefined) {
            argsRepr.push(objRepr);
            continue;
          }

          resolve(arg, scope)
            .onSuccess = (any) => {
            argsRepr.push(any);
          };
        }

        switch (currNode.callee.type) {
          case 'Identifier': {


            tokenStream.push({
              operation: 'call',
              operand0: currNode.callee.name,
              operand1: argsRepr,
              location: toENRELocation(currNode.callee.loc, ToENRELocationPolicy.PartialEnd),
            });
            currNode = undefined;
            break;
          }

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

      case 'OptionalMemberExpression':
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
          operation: 'access',
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

  return tokenStream;
}
