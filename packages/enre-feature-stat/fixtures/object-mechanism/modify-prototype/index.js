import {groupCountBy} from '../../_utils/post-process.js';

const BUILT_IN_OBJECTS = ['Object', 'Function', 'Boolean', 'Symbol', 'Error', 'AggregateError', 'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError', 'InternalError', 'Number', 'BigInt', 'Math', 'Date', 'String', 'RegExp', 'Array', 'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'BigInt64Array', 'BigUint64Array', 'Float32Array', 'Float64Array', 'Map', 'Set', 'WeakMap', 'WeakSet', 'ArrayBuffer', 'SharedArrayBuffer', 'DataView', 'Atomics', 'JSON', 'WeakRef', 'FinalizationRegistry', 'Iterator', 'AsyncIterator', 'Promise', 'GeneratorFunction', 'AsyncGeneratorFunction', 'Generator', 'AsyncGenerator', 'AsyncFunction', 'Reflect', 'Proxy', 'Intl',];

export default {
  dependencies: ['modify-to-prototype'],
  process: (res) => {
    const
      deduped = new Map(),
      group = groupCountBy(res, 'contentType');

    res.forEach(record => {
      if (deduped.has(record.usageOid) && record.hostType !== '-') {
        deduped.set(record.usageOid, record);
      } else if (!deduped.has(record.usageOid)) {
        deduped.set(record.usageOid, record);
      }
    });

    const values = [...deduped.values()];

    return {
      'all-modify-to-prototype-usages': deduped.size,

      'types-modify-to': {
        'ModifyClass': values.filter(record => record.hostType === 'ClassDeclaration').length,
        'ModifyFunction': values.filter(record => record.hostType === 'FunctionDeclaration').length,
        'ModifyBuiltIn': values.filter(record => BUILT_IN_OBJECTS.includes(record.hostName)).length,
      },

      'types-entity': group,
    };
  }
};
