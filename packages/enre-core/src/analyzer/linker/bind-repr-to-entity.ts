import {JSMechanism} from '../visitors/common/literal-handler';
import lookup from './lookup';
import lookdown from './lookdown';

/**
 * Find what a symbol reference within an JSObjRepr refers to and IN PLACE replace it
 * with the symbol's pointsTo.
 */
export default function bind(objRepr: JSMechanism, scope: any): any {
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
  }

  // TODO: Does this still needed under the new data structure?
  // If objRepr is already an ENRE entity, then return it without any modification.
  return objRepr;
}
