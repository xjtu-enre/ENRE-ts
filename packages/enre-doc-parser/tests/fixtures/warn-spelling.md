## Entity: Variable

A `Variable Entity` is a variable defined by keywords `let`
/`const`/`var`.

### Supported pattern

```yaml
name: Variable Declaration
```

#### syntax:Let and Const Declarations

```text
...
```

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
entities:
    filter: variable
    exact: true
    items:
        -   name: foo0
            loc: [ 1, 5 ]
            kind: let
        -   name: foo1
            loc: [ 3, 5 ]
            kind: let
```

#### syntax:Variable Statement

#### semantic:xxx

#### runtime:xxx

#### supplemental:xxx
