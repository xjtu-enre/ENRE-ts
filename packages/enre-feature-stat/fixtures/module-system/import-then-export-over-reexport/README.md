# Import Then Export Over Reexport

Import then export without any usage ot the imported thing can and should be simplified to
reexport.

## Patterns (3)

```js
import {foo, bar as baz, a as b} from './foo.js';

// No usage of `foo` in the whole file

// `baz` used
baz.x;

// `b` not used
baz.b;

export {foo, baz, b};
```

## Metrics

* #Usage%(Reexport Like)

## Tags

* static
