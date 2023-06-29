/**
 * ExpressionStatement
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

import {NodePath} from '@babel/traverse';
import {Expression, ExpressionStatement} from '@babel/types';
import {ENREEntityCollectionAll, recordRelationCall, recordRelationUse, rGraph} from '@enre/data';
import {toENRELocation} from '@enre/location';
import {ENREContext} from '../context';
import lookup from '../linker/lookup';
import {codeLogger} from '@enre/core';

type PathType = NodePath<ExpressionStatement>

export default (path: PathType, {scope}: ENREContext) => {
  const from = scope.last();

  // TODO: Type TokenStream
  const tokenStream = [];

  // Convert AST to token stream
  let nextNode: Expression | undefined = path.node.expression;
  while (nextNode !== undefined) {
    switch (nextNode.type) {
      case 'CallExpression': {
        switch (nextNode.callee.type) {
          case 'Identifier':
            tokenStream.push({
              operation: 'call',
              operand: nextNode.callee.name,
              location: toENRELocation(nextNode.callee.loc)
            });
            nextNode = undefined;
            break;

          case 'MemberExpression': {
            const prop = nextNode.callee.property;
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
                location: toENRELocation(nextNode.callee.property.loc)
              });
              nextNode = nextNode.callee.object;
            } else {
              nextNode = undefined;
            }
            break;
          }
        }
        break;
      }

      case 'MemberExpression': {
        const prop = nextNode.property;
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
            location: toENRELocation(nextNode.property.loc)
          });
          nextNode = nextNode.object;
        } else {
          nextNode = undefined;
        }
        break;
      }

      case 'NewExpression': {
        if (nextNode.callee.type === 'Identifier') {
          tokenStream.push({
            operation: 'new',
            operand: nextNode.callee.name,
            location: toENRELocation(nextNode.callee.loc)
          });
        }
        nextNode = undefined;
        break;
      }

      case 'Identifier': {
        tokenStream.push({operation: 'accessObj', operand: nextNode.name, location: toENRELocation(nextNode.loc)});
        nextNode = undefined;
        break;
      }

      default:
        nextNode = undefined;
    }
  }

  /**
   * Interpret the stream (by reverse enumerating) immediately
   *
   * Since one cannot access uninitialized variable,
   * a simple assumption that all references are properly
   * initialized before is made here.
   */
  let currSymbol: ENREEntityCollectionAll | undefined = undefined;
  for (let i = tokenStream.length - 1; i !== -1; i--) {
    const token = tokenStream[i];
    codeLogger.debug(`IR: ${token.operation}-${token.operand}`);
    switch (token.operation) {
      case 'accessObj': {
        const found = lookup({role: 'value', identifier: token.operand, at: from});
        if (found) {
          currSymbol = found as ENREEntityCollectionAll;
          rGraph.add(recordRelationUse(
            from,
            currSymbol,
            token.location,
          ));
        }
        break;
      }

      case 'new': {
        const found = lookup({role: 'value', identifier: token.operand, at: from});
        if (found) {
          currSymbol = found as ENREEntityCollectionAll;
          rGraph.add(recordRelationCall(
            from,
            currSymbol,
            token.location,
          ));
        }
        break;
      }

      case 'call': {
        if (currSymbol) {
          let found = undefined;
          for (const child of currSymbol.children) {
            if (child.name.codeName === token.operand) {
              found = child;
            }
          }

          if (found) {
            rGraph.add(recordRelationCall(
              from,
              found,
              token.location,
            ));
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
            rGraph.add(recordRelationUse(
              from,
              found,
              token.location,
            ));
          }

          currSymbol = undefined;
        }
        break;
      }
    }
  }
};
