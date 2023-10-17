import {JSMechanism} from '../visitors/common/resolveJSObj';
import lookup from './lookup';

export default function resolve(objRepr: JSMechanism, scope: any): any {
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
  } else if (objRepr.type === 'object') {
    for (const [index, item] of Object.entries(objRepr.iterator)) {
      const resolved = resolve(item, scope);
      // @ts-ignore
      objRepr.iterator[index] = resolved;
    }
  }

  return objRepr;
}
