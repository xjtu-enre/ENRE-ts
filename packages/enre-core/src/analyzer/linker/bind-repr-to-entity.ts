import {JSMechanism} from '../visitors/common/resolveJSObj';
import lookup from './lookup';
import lookdown from './lookdown';

export default function bind(objRepr: JSMechanism, scope: any): any {
  // TODO: Decide whether replace in-place or return new object?
  if (objRepr.type === 'reference') {
    const found = lookup({
      role: 'value',
      identifier: objRepr.value,
      at: scope,
    });

    if (found) {
      return found;
    }
  } else if (objRepr.type === 'receipt') {
    const found = lookdown('loc-key', objRepr.key, scope);

    if (found) {
      return found;
    }
  } else if (objRepr.type === 'object') {
    for (const [index, item] of Object.entries(objRepr.kv)) {
      const resolved = bind(item, scope);
      // @ts-ignore
      objRepr.kv[index] = resolved;
    }
    for (const [index, item] of Object.entries(objRepr.iterator)) {
      const resolved = bind(item, scope);
      // @ts-ignore
      objRepr.iterator[index] = resolved;
    }
  }

  return objRepr;
}

// export function getArrayRest(objRepr: JSMechanism, startIndex): JSMechanism {
//
// }
