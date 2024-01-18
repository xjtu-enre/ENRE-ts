# Type Import/Export

Type import/export does not mean that only type entities are imported/exported, but that
statement will be directly removed while transpiling to JavaScript (without any analysis).

## Patterns

```ts
//     vvvv
import type {Type} from 'module';

//      vvvv
import {type Type} from 'module';

//     vvvv
export type {Type};
```

## Metrics

* #Usage%
