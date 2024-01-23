# Import Then Export Over Reexport

Import then export without any usage ot the imported thing can and should be simplified to
reexport.

## Patterns

```js
import {foo} from './foo.js';

// No usage of `foo` in the whole file

export {foo};
```

## Metrics

* #Usage%
