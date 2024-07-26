# Module Systems

## Patterns (2)

ESM:

```js
import {foo} from './foo.js';

await import('./foo.js');

export {bar};
```

CJS:

```js
const foo = require('./foo.js');

// Default export
module.exports = bar;
exports.default = bar;
// Named export
exports.bar = bar;
```

## Metrics

* #Usage%(File)

## Tags

* static
