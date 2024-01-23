# Monorepo

## Patterns

NPM workspace:

```json
// package.json
{
    workspaces: [
        "packages/*"
    ]
}
```

```js
// packages/b-package/index.js

// If it is a monorepo, then the source code of 'a-package' is available,
// and the definition of 'foo' can be found and resolved.
//      vvv       vvvvvvvvvvv
import {foo} from 'a-package';
```

<!-- TODO: Other monorepo package managers -->

Circular dependency:

```json
// /packages/a/package.json
{
    "dependencies": {
        "b": "any"
    }
}
```

```json
// /packages/b/package.json
{
    "dependencies": {
        "a": "any"
    }
}
```

## Metrics

* #Usage% (Against all repos)
* Average package count
* Does a package import another package?
* Have circular dependency?
