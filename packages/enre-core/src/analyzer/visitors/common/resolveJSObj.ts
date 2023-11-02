import {Expression} from '@babel/types';
import {ENRELocKey, toENRELocKey} from '@enre/location';
import {BindingPathRest} from './traverseBindingPattern';

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
  kvInitial: 'obj' | 'array',
  // TODO: Change undefined to the basic JS object
  prototype: JSMechanism | undefined,
  // These two are for Symbol.xxx exclusively, array literal is also recorded in kv
  iterator: undefined,
  asyncIterator: undefined,
  // TODO: handle callable
  callable: undefined,
}

function createJSObjRepr(kvInitial: JSObjRepr['kvInitial']): JSObjRepr {
  return {
    type: 'object',
    kv: {},
    kvInitial,
    prototype: undefined,
    iterator: undefined,
    asyncIterator: undefined,
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
    const objRepr = createJSObjRepr('array');

    for (const [index, element] of Object.entries(node.elements)) {
      // @ts-ignore
      const resolved = resolve(element);
      if (resolved) {
        // @ts-ignore
        objRepr.kv[index] = resolved;
      }
    }
    return objRepr;
  } else if (node.type === 'ObjectExpression') {
    const objRepr = createJSObjRepr('obj');

    for (const property of node.properties) {
      if (property.type === 'ObjectProperty') {
        // @ts-ignore
        const resolved = resolve(property.value);
        if (resolved) {
          if (property.key.type === 'Identifier') {
            objRepr.kv[property.key.name] = resolved;
          } else if (property.key.type === 'NumericLiteral') {
            objRepr.kv[property.key.value] = resolved;
          } else if (property.key.type === 'StringLiteral') {
            objRepr.kv[property.key.value] = resolved;
          }
        }
      }
    }
    return objRepr;
  } else if (['FunctionExpression', 'ClassExpression', 'ArrowFunctionExpression'].includes(node.type)) {
    return {
      type: 'receipt',
      // @ts-ignore
      key: toENRELocKey(node.id?.loc ?? node.loc)
    };
  } else {
    // expressionHandler();
  }

  return undefined;
}

// Uses a cache to avoid duplicate object creation
const cachedRestObjs = new Map<JSObjRepr, Map<BindingPathRest, JSMechanism>>();

export function getRest(objRepr: JSObjRepr, rest: BindingPathRest): JSMechanism | undefined {
  if (!cachedRestObjs.has(objRepr)) {
    cachedRestObjs.set(objRepr, new Map());
  }

  if (cachedRestObjs.get(objRepr)!.has(rest)) {
    return cachedRestObjs.get(objRepr)!.get(rest);
  }

  let newRepr = undefined;

  // Object rest
  if ('exclude' in rest) {
    newRepr = createJSObjRepr('obj');

    for (const [key, value] of Object.entries(objRepr.kv)) {
      if (!rest.exclude.includes(key)) {
        newRepr.kv[key] = value;
      }
    }
  }
  // Array rest
  else if ('start' in rest) {
    newRepr = createJSObjRepr('array');

    let newCounter = 0;

    for (const [key, value] of Object.entries(objRepr.kv)) {
      // @ts-ignore
      if (parseInt(key) >= parseInt(rest.start)) {
        newRepr.kv[newCounter] = value;
        newCounter += 1;
      }
    }
  }

  cachedRestObjs.get(objRepr)!.set(rest, newRepr as JSMechanism);

  return newRepr;
}
