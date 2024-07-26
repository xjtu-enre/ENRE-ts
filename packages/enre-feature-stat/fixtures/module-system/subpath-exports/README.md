# Subpath Exports

## Patterns (1)

```json
// package.json
{
    "exports": {
        "./foo.js": "./long/path/to/foo.js"
    }
}
```

```js
// Only exported subpaths are valid
//                 vvvvvvvvvvvvv
import {foo} from 'module/foo.js';

// Since 'bar.js' was not exported, this will throw error
//                 vvvvvvvvvvvvv
import {bar} from 'module/bar.js';
```

## Metrics

* #Usage%(Repo)

## Tags

* static
