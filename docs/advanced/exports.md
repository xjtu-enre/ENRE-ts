## Export

Imported entities are READ ONLY and can only be modified by exporters (exported functions that internally modify the wanted value).

### Supported Patterns

```yaml
name: Advanced Import
```

#### Semantic: Import

##### Examples

###### Named import

<!-- external/attribute -->

```ts
export class Cls {
    constructor() {
        /* Empty */
    }

    fun() {
        /* Empty */
    }
}
``` 

```ts
import { Cls } from '.file0';

const a = new Cls();
a.fun();
```

```yaml
relation:
    items:
        -   from: file:'<File file1.ts>'
            to: class:'Cls'
            loc: file1:1:10
            type: import
        -   from: file:'<File file1.ts>'
            to: method:'file0.cls.fun'
            loc: file1:4:1
            type: call
            implicit: true
```

###### Assign import

<!-- external/attribute_assign -->

```ts
export class Cls {
    constructor() {
        /* Empty */
    }

    fun() {
        /* Empty */
    }
}
``` 

```ts
import { Cls } from './file0';

function fn(a) {
    a();
}

const a = new Cls();
fn(a.fun());
```

```yaml
relation:
    items:
        -   from: file:'<File file1.ts>'
            to: class:'Cls'
            loc: file1:1:10
            type: import
        -   from: file:'<File file1.ts>'
            to: method:'file0.Cls.fun'
            loc: file1:4:1
            type: call
            implicit: true
```

###### Class Parent

<!-- external/cla_parent -->

A self call to a function defined inside an external parent.

```ts
export class Parent {
    ParentFunc() {
        /* Empty */
    }
}
```

```ts
import { Parent } from '.file0';

class A extends Parent {
    fn() {
        this.ParentFunc();
    }
}

const a = new A();
a.fn();
```

```yaml
relation:
    items:
        -   from: file:'<File file1.ts>'
            to: class:'Parent'
            loc: file1:1:10
            type: import
        -   from: class:'A'
            to: class:'Parent'
            loc: file0:5:19
            type: extend
        -   from: file:'<File file1.ts>'
            to: method:'file3.Parent.ParentFunc'
            loc: file1:4:1
            type: call
            implicit: false
```

###### Function

<!-- external/function -->

A call on an externally imported function.

```ts
export function myFunction() {
    /* Empty */
}
```

```ts
import { myFunction } from './file5';

myFunction();
```

```yaml
relation:
    items:
        -   from: file:'<File file1.ts>'
            to: class:'myFunction'
            loc: file1:1:10
            type: import
        -   from: file:'<File file1.ts>'
            to: function:'file5.myFunction'
            loc: file1:4:1
            type: call
            implicit: false
```

###### Namespace Import

<!-- external/function_asname, external/function_assigned -->

```ts
export function func() {
    /* Empty */
}

export class Class {
    /* Empty */
}
```

```ts
import * as AWholeModule from './file0.js';
// All exports are packed into a single object

// Usage
AWholeModule.func();
new AWholeModule.Class();
```

```yaml
relation:
    items:
        -   from: file:'<File file1.ts>'
            to: file:'<File file0.ts>'
            loc: file1:1:7
            type: import
        -   from: alias:'AWholeModule'
            to: file:'<File file1.ts>'
            loc: file1:1:13
            type: aliasof
        -   from: file:'<File file1.ts>'
            to: function:'file7.func'
            loc: file1:5:1
            type: call
            implicit: false
```
