import {Expression} from '@babel/types';
import {ENRELocKey, toENRELocKey} from '@enre/location';
import {BindingPathRest} from './binding-pattern-handler';
import {ENREEntityFunction, ENREEntityMethod} from '@enre/data';

export type JSMechanism = JSReference | JSObjRepr | JSReceipt;

export interface JSReference {
  type: 'reference',
  value: string,
}

export interface JSReceipt {
  type: 'receipt',
  key: ENRELocKey,
}

export interface JSCallable {
  entity: ENREEntityFunction | ENREEntityMethod,
  returns: any[],
}

export interface JSObjRepr {
  // To distinguish from other ENREEntity types
  type: 'object',
  // Object literal keys as well as array literal indices
  kv: {
    // ENREEntity as symbol
    [key: string]: JSMechanism,
  },
  // This object is declared as an object literal or an array literal
  // This affects how ...(rest operator) works on keys
  kvInitial: 'obj' | 'array',
  // TODO: Change undefined to the basic JS object
  prototype: JSMechanism | undefined,
  // A compound representation for callables
  callable:
  // Normal call to functions, record in show-up order where index is the key
    JSCallable[] & {
    // Symbol.iterator (Can be multiple, thus an array)
    iterator?: JSCallable[],
    // Symbol.asyncIterator (Can be multiple, thus an array)
    asyncIterator?: JSCallable[],
  },
}


export function createJSObjRepr(kvInitial: JSObjRepr['kvInitial']): JSObjRepr {
  return {
    type: 'object',
    kv: {},
    kvInitial,
    prototype: undefined,
    callable: [],
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
const cachedRestObjs = new Map<JSObjRepr, Map<BindingPathRest, JSObjRepr>>();

export function getRest(objRepr: JSObjRepr, rest: BindingPathRest): JSObjRepr | undefined {
  if (!cachedRestObjs.has(objRepr)) {
    cachedRestObjs.set(objRepr, new Map());
  }

  // Get the previously created new rest JSObjRepr (if exist)
  let newRepr = cachedRestObjs.get(objRepr)!.get(rest);
  // kv still needs to be re-evaluated since parameter objRepr could have kv updated

  // Object rest
  if ('exclude' in rest) {
    if (!newRepr) {
      newRepr = createJSObjRepr('obj');
    }

    for (const [key, value] of Object.entries(objRepr.kv)) {
      if (!rest.exclude.includes(key)) {
        newRepr.kv[key] = value;
      }
    }
  }
  // Array rest
  else if ('start' in rest) {
    if (!newRepr) {
      newRepr = createJSObjRepr('array');
    }

    let newCounter = 0;

    for (const [key, value] of Object.entries(objRepr.kv)) {
      // @ts-ignore
      if (parseInt(key) >= parseInt(rest.start)) {
        newRepr.kv[newCounter] = value;
        newCounter += 1;
      }
    }
  }

  if (newRepr && cachedRestObjs.get(objRepr)) {
    cachedRestObjs.get(objRepr)!.set(rest, newRepr);
  }

  return newRepr;
}
