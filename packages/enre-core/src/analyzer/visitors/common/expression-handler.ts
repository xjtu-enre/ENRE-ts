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
  LVal,
  PrivateName,
  SpreadElement,
  ThrowStatement
} from '@babel/types';
import {
  ENREEntityCollectionInFile,
  ENREEntityCollectionScoping,
  postponedTask
} from '@enre-ts/data';
import {ENRELocation, toENRELocation, ToENRELocationPolicy} from '@enre-ts/location';
import {ENREContext} from '../../context';
import resolveJSObj, {createJSObjRepr, JSObjRepr} from './literal-handler';


/**
 * Types
 */

// An ascend task object, containing information for resolving a VariableDeclaration.
export type AscendPostponedTask = {
  type: 'ascend',
  payload: any,
  scope: ENREEntityCollectionScoping,
}

// A descend task object, containing necessary information for resolving an expression.
export type DescendPostponedTask = {
  type: 'descend',
  payload: TokenStream,
  scope: ENREEntityCollectionScoping,
  onFinish?: (symbolSnapshot: any) => void,
}

/**
 * Token stream that is translated from the given expression AST node.
 * Tokens are in reverse order.
 */
type TokenStream = ExpressionToken[];

type ExpressionToken =
  CallToken
  | NewToken
  | AccessToken
  | AssignToken;

/**
 * There should be a token type 'copy' responding for JS import/export alias
 * that propagate non-alias entity's all belonging pointsTo to all its alias. (Note that
 * the alias chain may not be only one edge, but many)
 *
 * However, this may be memory consuming (given the same set of pointsTo is stored in all
 * alias entities and the raw entity), currently the alias handling is in the function
 * `lookup` if the second argument is true (omitAlias), which given an alias name, the
 * function will go through the alias chain until the raw entity is met.
 */

/**
 * A token is basically a (simplified) three-address code.
 * See comments for full view of token's shape and field declarations.
 */
interface BaseToken {
  /**
   * The operation of the token.
   */
  // operation: string as const,

  /**
   * The first operand of the token.
   * In three-address code system, this is what the operation manipulate on.
   * In ENRE, this always refers to the result of a previous token, thus it is never set
   * in the token stream.
   *
   * (SUBJECT TO DESIGN CHANGE)
   */
  // operand0: undefined,

  /**
   * The second operand of the token.
   * The meaning of this operand varies with the operation.
   * See each token below for specific meaning.
   */
  // operand1: any,

  location: ENRELocation,
}

interface CallableBaseToken extends BaseToken {
  // Arguments, in the raw present order
  operand1: JSObjRepr,
}

interface CallToken extends BaseToken, CallableBaseToken {
  operation: 'call',
}

interface NewToken extends BaseToken, CallableBaseToken {
  operation: 'new',
}

interface AccessToken extends BaseToken {
  operation: 'access',
  // Force override currSymbol
  operand0?: any,
  // Not exist if operand0 exist
  operand1: string,
}

interface AssignToken extends BaseToken {
  operation: 'assign',
  // Can only be an access token
  operand0: AccessToken,
  operand1: any,
}

interface PassToken {
  operation: 'pass',
  operand0: any,
}


/**
 * Implementations
 */

interface CustomHandlers {
  last?: (entity: ENREEntityCollectionInFile, loc: ENRELocation) => void;
}

type ResolvableNodeTypes =
  Expression
  | SpreadElement
  | JSXNamespacedName
  | ArgumentPlaceholder
  | LVal
  | ThrowStatement
  | PrivateName;

export default function resolve(
  node: ResolvableNodeTypes,
  scope: ENREContext['scope'],
  handlers?: CustomHandlers,
) {
  try {
    const tokens = recursiveTraverse(node, scope, handlers);

    if (tokens.length === 0) {
      return undefined;
    }

    // The resolve of token stream is postponed to the linker.
    const task: DescendPostponedTask = {
      type: 'descend',
      payload: tokens,
      scope: scope.last(),
      onFinish: undefined,
    };
    postponedTask.add(task);

    return task;
  } catch (e) {
    // Failed to create IR
  }
}

/**
 * Traverse the AST node recursively, generate a token stream, but not create
 * corresponding postponedTask, just return it for callee to merge.
 */
function recursiveTraverse(
  node: ResolvableNodeTypes,
  scope: ENREContext['scope'],
  handlers?: CustomHandlers
): TokenStream {
  const tokenStream: TokenStream = [];

  // TODO: Handle points-to propagation by try-catch
  switch (node.type) {
    case 'AssignmentExpression': {
      const leftTask = resolve(node.left, scope, handlers)!;

      if (['FunctionExpression', 'ArrowFunctionExpression', 'ClassExpression'].includes(node.right.type)) {
        const objRepr = resolveJSObj(node.right);
        leftTask.onFinish = (symbolSnapshotLeft: any) => {
          // postponedTask.add({
          //   type: 'descend',
          //   payload: [
          //     {
          //       operation: 'assign',
          //       operand0: undefined,
          //       operand1: undefined,
          //     },
          //     {
          //       operation: 'access',
          //       operand0: symbolSnapshotLeft,
          //     }
          //   ],
          //   scope: scope.last(),
          //   onFinish: undefined,
          // } as DescendPostponedTask);
        };
      } else {
        const rightTask = resolve(node.right, scope, handlers);

        /**
         * Pick the last token of the left task and form a new task for the assignment
         * operation, so that linker knows to create a new property if the expression tries
         * to assign to a non-existing property.
         */
        const assignmentTarget = leftTask?.payload.shift();

        if (rightTask && assignmentTarget) {
          rightTask.onFinish = (symbolSnapshotRight: any) => {
            leftTask.onFinish = (symbolSnapshotLeft: any) => {
              postponedTask.add({
                type: 'descend',
                payload: [
                  {
                    operation: 'assign',
                    operand0: assignmentTarget,
                    operand1: symbolSnapshotRight,
                  },
                  {
                    operation: 'access',
                    operand0: symbolSnapshotLeft,
                  }
                ],
                scope: scope.last(),
                onFinish: undefined,
              } as DescendPostponedTask);
            };
          };
        }
      }
      break;
    }

    case 'OptionalCallExpression':
    case 'NewExpression':
    case 'CallExpression': {
      let operation: 'call' | 'new' = 'call';
      if (node.type === 'NewExpression') {
        operation = 'new';
      }

      // @ts-ignore TODO: callee can be V8IntrinsicIdentifier
      const calleeTokens = recursiveTraverse(node.callee, scope, handlers);

      /**
       * Resolve arguments of the call expression.
       * The shape of argsRepr is still a JSObjRepr (for uniformed handling).
       */
      const argsRepr = createJSObjRepr('array');

      for (const [index, arg] of Object.entries(node.arguments)) {
        // @ts-ignore
        const objRepr = resolveJSObj(arg);
        if (objRepr !== undefined) {
          argsRepr.kv[index] = objRepr;
          continue;
        }

        const argTask = resolve(arg, scope);
        if (argTask) {
          argTask.onFinish = (symbolSnapshot) => {
            argsRepr.kv[index] = symbolSnapshot;
          };
        }
      }

      tokenStream.push({
        operation,
        operand1: argsRepr,
        location: toENRELocation(node.callee.loc, ToENRELocationPolicy.PartialEnd),
      }, ...calleeTokens);
      break;
    }

    case 'OptionalMemberExpression':
    case 'MemberExpression': {
      const objectTokens = recursiveTraverse(node.object, scope, handlers);

      const prop = node.property;
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
          operation: 'access',
          operand1: propName,
          location: toENRELocation(node.property.loc)
        }, ...objectTokens);
      } else {
        const propTask = resolve(node.property, scope, undefined);

        if (propTask) {
          propTask.onFinish = (symbolSnapshot) => {
            symbolSnapshot.forEach((s: any) => {
              postponedTask.add({
                type: 'descend',
                payload: [
                  {
                    operation: 'access',
                    operand1: s,
                    location: toENRELocation(node.property.loc),
                  },
                  ...objectTokens,
                ],
                scope: scope.last(),
                onFinish: undefined,
              } as DescendPostponedTask);
            });
          };
        }
      }
      break;
    }

    case 'Identifier': {
      tokenStream.push({
        operation: 'access',
        operand1: node.name,
        location: toENRELocation(node.loc)
      });
      break;
    }

    case 'Super': {
      tokenStream.push({
        operation: 'access',
        operand1: 'super',
        location: toENRELocation(node.loc)
      });
      break;
    }

    case 'NumericLiteral': {
      tokenStream.push({
        operation: 'access',
        operand1: node.value.toString(),
        location: toENRELocation(node.loc),
      });
      break;
    }

    case 'StringLiteral': {
      tokenStream.push({
        operation: 'access',
        operand1: node.value,
        location: toENRELocation(node.loc),
      });
      break;
    }
  }

  return tokenStream;
}
