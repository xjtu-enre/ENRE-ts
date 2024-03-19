# Type Import/Export

Type import/export does not mean that only type entities are imported/exported, but that
statement will be directly removed while transpiling to JavaScript (without any analysis).

## Patterns

```ts
//     vvvv
import type {Any, Any1} from 'module';

//      vvvv
import {type Any2, Any3} from 'module';

//     vvvv New in TS5.0, but not a syntax error in older versions
import type * as Any4 from 'module';

//     vvvv
import type Any5 from 'module';

import {Any4} from 'module';


//     vvvv
export type {Any};

//      vvvv
export {type Any, Any1};

export {Any3};

//     vvvv New in TS5.0, but not a syntax error in older versions
export type * as Any6 from 'module';
```

All import/export declaration test:

```ts
export default foo
export default [expression]

export function foo() {
}

export default function foo() {
}
export {foo}
export type {foo}
export {type foo}
export {foo} from 'xxx' assert {}
export * from 'xxx' assert {}
export * as a from 'xxx'
export type {foo} from 'xxx'
export {type foo} from 'xxx'
export type * from 'xxx'
export type * as a from 'xxx'

import xxx from 'xxx' assert {}
import type xxx from 'xxx'
import xxx, {a} from 'xxx'
import xxx, * as b from 'xxx'
import * as c from 'xxx'
import type * as d from 'xxx'
import {a as b, c} from 'xxx'
import {} from 'xxx'
import type {xxx} from 'xxx'
import {type xxx} from 'xxx'
import 'xxx'
import 'xxx' assert {}
```

## Metrics

* #Usage%(Type-able Import/Export Element)

<!--* Types{ContainsValueEntity, ContainsTypeEntityOnly}
    * ContainsValueEntity: The type Import/Export declaration contains JS value entity
    * ContainsTypeEntityOnly: The type Import/Export declaration contains only type entity-->

## Tags

* static
* typing
