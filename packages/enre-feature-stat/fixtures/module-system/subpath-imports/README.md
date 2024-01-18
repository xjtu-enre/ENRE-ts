# Subpath Imports

## Patterns

The declaration pattern can be complex, see [the doc](https://nodejs.org/api/packages.html#subpath-imports).

```json
// package.json
{
  "imports": {
    "#foo": "./long/path/to/foo.js"
  }
}
```

```js
// The local import specifier starts with #
//                 vvvv
import {foo} from '#foo';
```

## Metrics

* #Repo%
