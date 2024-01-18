# Module Systems

## Patterns

ESM:

```js
import {foo} from './foo.js';
await import('./foo.js');

export {bar};
```

CJS:

```js
const foo = require('./foo.js');

module.exports = bar;
```

## Metrics

* #Repo%
