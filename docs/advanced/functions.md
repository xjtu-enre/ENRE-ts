## Functions

A function declaration tells the compiler the name of the function, its return type, and its parameters. A function definition provides the actual body of the function.

### Supported Patterns

```yaml
name: Advanced Functions
```

#### Semantic: Function

##### Examples

###### Call+ Assigned Call+ Assigned Call With Param

<!-- functions/call, functions/assigned_call, functions/assigned_call_lit_param -->

```ts
function func(x) {
    return x;
}

const x = func;
x(1);
x("y");
``` 

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.ts>'
            to: function:'func'
            loc: 6:1:1
        -   from: file:'<File file0.ts>'
            to: function:'func'
            loc: 7:1:1            
```

###### Imported Call

<!-- functions/imported_call -->

```ts
export function func() {
    /* Empty */
}
```

```ts
import { func } from './file0';

const a = func;
a();
```

```yaml
relation:
    items:
        -   from: file:'<File file1.ts>'
            to: function:'func'
            loc: file1:1:10
            type: import
        -   from: file:'<File file1.ts>'
            to: function:'file1.func'
            loc: file1:4:1
            type: call
            implicit: true
```
