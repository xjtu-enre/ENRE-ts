## Entity: Variable

A `Variable Entity` is a variable defined by keywords `let`
/`const`/`var`.

WARN 1: Should capitalize the first letter

### Supported pattern

```yaml
name: Variable Declaration
```

WARN 2: Should leave a space after comma

#### syntax:Let and Const Declarations

```text
...
```

WARN 3: Should capitalize the first letter

##### examples

This part illustrates the basic usage of declaring variables
using `let`/`const`.

###### A simple variable declaration with `let`

```js
let foo0;

let foo1 = "bar";
```

```yaml
name: usingLet
entity:
    type: variable
    extra: false
    items:
        -   name: foo0
            loc: [ 1, 5 ]
            kind: let
        -   name: foo1
            loc: [ 3, 5 ]
            kind: let
```
