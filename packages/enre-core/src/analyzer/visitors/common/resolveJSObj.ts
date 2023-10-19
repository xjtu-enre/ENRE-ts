import {Expression} from '@babel/types';
import {ENRELocKey, toENRELocKey} from '@enre/location';

export type JSMechanism = JSReference | JSObjRepr | JSReceipt;

interface JSReference {
  type: 'reference',
  value: string,
}

interface JSReceipt {
  type: 'receipt',
  key: ENRELocKey,
}

interface JSObjRepr {
  type: 'object',
  kv: { [key: string]: JSMechanism },
  // TODO: Change undefined to the basic JS object
  prototype: JSMechanism | undefined,
  iterator: JSMechanism[],
  asyncIterator: JSMechanism[],
  // TODO: handle callable
  callable: undefined,
}

function createJSObjRepr(): JSObjRepr {
  return {
    type: 'object',
    kv: {},
    prototype: undefined,
    iterator: [],
    asyncIterator: [],
    callable: undefined,
  };
}

export default function resolve(node: Expression | null | undefined): JSMechanism | undefined {
  if (!node) {
    return undefined;
  }

  if (node.type === 'Identifier') {
    return {type: 'reference', value: node.name};
  } else if (node.type === 'ArrayExpression') {
    const objRepr = createJSObjRepr();

    for (const element of node.elements) {
      // @ts-ignore TODO: Remove ignore
      const resolved = resolve(element);
      if (resolved) {
        objRepr.iterator.push(resolved);
      }
    }
    return objRepr;
  } else if (node.type === 'ObjectExpression') {
    const objRepr = createJSObjRepr();

    for (const property of node.properties) {
      if (property.type === 'ObjectProperty') {
        // @ts-ignore
        const resolved = resolve(property.value);
        if (resolved) {
          // @ts-ignore
          objRepr.kv[property.key.name] = resolved;
        }
      }
    }
    return objRepr;
  } else if (['FunctionExpression', 'ClassExpression', 'ArrowFunctionExpression'].includes(node.type)) {
    return {
      type: 'receipt',
      key: toENRELocKey(node.id?.loc ?? node.loc)
    };
  } else {
    // expressionHandler();
  }

  return undefined;
}
