import {Expression} from '@babel/types';

type JSMechanism = JSIdentifier | JSObjRepr;

interface JSIdentifier {
  type: 'identifier',
  value: string,
}

interface JSObjRepr {
  type: 'object',
  kv: object,
  // TODO: Change undefined to the basic JS object
  prototype: JSObjRepr | undefined,
  iterator: JSMechanism[],
  asyncIterator: JSMechanism[],
}

function createJSObjRepr(): JSObjRepr {
  return {
    type: 'object',
    kv: {},
    prototype: undefined,
    iterator: [],
    asyncIterator: [],
  };
}

export default function resolve(node: Expression | null | undefined): JSMechanism | undefined {
  if (!node) {
    return undefined;
  }

  if (node.type === 'Identifier') {
    return {type: 'identifier', value: node.name};
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
    return undefined;
  }

  return undefined;
}
