# Side Effect Import

## Patterns (3)

> Ref: [Test Case](../../../../../docs/relation/import.md#side-effects-only-import)

```js
import './file0.js';

import {} from './file0.js';

export {} from 'a';
```

## Metrics

* #Usage%(Import Declaration)
* Types{EmptyBraceImport, EmptyBraceReexport, NoBrace}
    * EmptyBraceImport: `import {} from 'module'`
    * EmptyBraceReexport: `export {} from 'module'`
    * NoBrace: `import 'module'`

## Tags

* static
