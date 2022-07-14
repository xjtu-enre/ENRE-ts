## Entity: Variable

A `Variable Entity` is a variable defined by keywords `let`
/`const`/`var`.

### Supported Pattern

```yaml
name: Variable declaration
```

#### Syntax: Let and Const Declarations

```text
...
```

##### Examples

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

#### Syntax: Variable Statement

```text
...
```

> `var` has not been recommended to be used since ES6+ due to
>
> * global/function-wise scope:

##### Examples

This part illustrates the basic usage of declaring variables
using `var`.

###### A simple variable declaration with `var`

```js
var foo;
```

```yaml
name: usingVar
entity:
    type: variable
    extra: false
    items:
        -   name: foo
            loc: [ 1, 5 ]
            kind: var
```
