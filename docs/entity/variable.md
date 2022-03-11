## Entity: Variable

A `Variable Entity` is a variable defined by keywords `let`/`const`/`var`.

### Supported pattern

```yaml
name: variableDeclaration
```

**Syntax:**

```text
LexicalDeclaration :
    LetOrConst BindingList ;

LetOrConst :
    `let`
    `const`

BindingList :
    LexicalBinding
    BindingList , LexicalBinding

LexicalBinding :
    BindingIdentifier [Initializer]
    BindingPattern Initializer

BindingIdentifier :
    Identifier
    `yield`
    `await`
```

**Examples:**

This part illustrate the basic usage of declaring variables using `let`/`const`.

* A simple variable declaration with `let`

```js
let foo0;

let foo1 = "bar";
```

```yaml
name: usingLet
filter: variable
entities:
    -   name: foo0
        loc: [ 1, 5 ]
        kind: let
    -   name: foo1
        loc: [ 3, 5 ]
        kind: let
```

* A simple variable declaration with `const`

Once the `const` variable is defined, any further re-assignment will not be allowed.

```js
const foo = "bar";

// foo = "bar1";   // TypeError: Assignment to constant variable.
```

```yaml
name: usingConst
filter: variable
entities:
    -   name: foo
        loc: [ 1, 7 ]
        kind: const
```

* Declare multiple variables in a single line of code

```js
let a, b, c = "bar";
// Only variable`c` is assigned with string literal "bar"
```

```yaml
name: multipleVarsInSingleLine
filter: variable
entities:
    -   name: a
        loc: [ 1, 5 ]
        kind: let
    -   name: b
        loc: [ 1, 8 ]
        kind: let
    -   name: c
        loc: [ 1, 11 ]
        kind: let
```

**Syntax:**

```text
BindingPattern :
    ObjectBindingPattern
    ArrayBindingPattern

ObjectBindingPattern :
    `{` `}`
    `{` BindingRestProperty `}`
    `{` BindingPropertyList `}`
    `{` BindingPropertyList `,` [BindingRestProperty] `}`

ArrayBindingPattern :
    `[` [Elision] [BindingRestElement] `]`
    `[` BindingElementList `]`
    `[` BindingElementList `,` [Elision] [BindingRestElement] `]`

BindingRestProperty :
    `...` BindingIdentifier

BindingPropertyList :
    BindingProperty
    BindingPropertyList `,` BindingProperty

BindingElementList :
    BindingElisionElement
    BindingElementList `,` BindingElisionElement

BindingElisionElement :
    [Elision] BindingElement

BindingProperty :
    SingleNameBinding
    PropertyName `:` BindingElement

BindingElement :
    SingleNameBinding
    BindingPattern [Initializer]

SingleNameBinding :
    BindingIdentifier [Initializer]

BindingRestElement :
    `...` BindingIdentifier
    `...` BindingPattern
```

**Examples:**

This part illustrate the usage of destructuring assignment.

* Simple object destructuring assignment

```js
let {a, b, c} = {a: 1, b: 2, c: 3, d: 4};
// `a`, `b`, `c` equals to 1, 2, 3 respectively
// Note that `d` in the right side is emitted
```

```yaml
name: objectDestructuring
filter: variable
entities:
    -   name: a
        loc: [ 1, 6 ]
        kind: let
    -   name: b
        loc: [ 1, 9 ]
        kind: let
    -   name: c
        loc: [ 1, 12 ]
        kind: let
```

* Simple array destructuring assignment

```js
let [a, b, c] = [1, 2, 3, 4];
// `a`, `b`, `c` equals to 1, 2, 3 respectively
```

```yaml
name: arrayDestructuring
filter: variable
entities:
    -   name: a
        loc: [ 1, 6 ]
        kind: let
    -   name: b
        loc: [ 1, 9 ]
        kind: let
    -   name: c
        loc: [ 1, 12 ]
        kind: let
```

* Array destructuring with comma elision

```js
let [, , a] = [1, 2, 3, 4];
// `a` equals to 3 since 2 comma appear before itself

let [, , b] = [1, 2];
// Initializer's lengther doesn't matter, `b` will be undefined
```

```yaml
name: arrayDestructuringWithCommaElision
filter: variable
entities:
    -   name: a
        loc: [ 1, 10 ]
        kind: let
    -   name: b
        loc: [ 4, 10 ]
        kind: let
```

* Object destructuring with `rest` operator

```js
let {a, b, ...r} = {a: 1, b: 2, c: 3, d: 4};
// `r` equals to { c: 3, d: 4 }
```

```yaml
name: objectDestructuringWithRestOperator
filter: variable
entities:
    -   name: a
        loc: [ 1, 6 ]
        kind: let
    -   name: b
        loc: [ 1, 9 ]
        kind: let
    -   name: r
        loc: [ 1, 15 ]
        kind: let
```

* Complex object destructuring

```js
let {a, b, c: {d}} = {a: 1, b: 2, c: {d: 3}};
// `a`, `b`, `d` equals to 1, 2, 3 respectively
// Note that `c` will be neither declared nor assigned
```

```yaml
name: multiLayerObjectDestructuring
filter: variable
entities:
    -   name: a
        loc: [ 1, 6 ]
        kind: let
    -   name: b
        loc: [ 1, 9 ]
        kind: let
    -   name: d
        loc: [ 1, 16 ]
        kind: let
```

* Mixed object and array destructuring

```js
let {a, b: [c, d]} = {a: 1, b: [2, 3]};

let [{foo}, {bar}] = [{foo: 1, alpha: 3}, {bar: 2, beta: 4}]
```

```yaml
name: mixedDestructuring
filter: variable
entities:
    -   name: a
        loc: [ 1, 6 ]
        kind: let
    -   name: c
        loc: [ 1, 13 ]
        kind: let
    -   name: d
        loc: [ 1, 16 ]
        kind: let
    -   name: foo
        loc: [ 3, 7 ]
        kind: let
    -   name: bar
        loc: [ 3, 14 ]
        kind: let
```

* Destructuring assignment with default value

```js
let {a = 1, b = 2, c} = {a: 11, c: 13, d: 14};
// `a`, `b`, `c` equals to 11, 2, 13 respectively
// Note that the default value of `a` is overrode

// If no default value is set, `undefined` will be returned
let {foo, bar = 1} = {bar: 11};
// `foo` equals to `undefined`
```

```yaml
name: desctructuringWithDefaultValue
filter: variable
entities:
    -   name: a
        loc: [ 1, 6 ]
        kind: let
    -   name: b
        loc: [ 1, 13 ]
        kind: let
    -   name: c
        loc: [ 1, 20 ]
        kind: let
    -   name: foo
        loc: [ 6, 6 ]
        kind: let
    -   name: bar
        loc: [ 6, 11 ]
        kind: let
```

**Syntax:**

```text
VariableStatement :
    `var` VariableDeclarationList ;

VariableDeclarationList :
    VariableDeclaration
    VariableDeclarationList `,` VariableDeclaration

VariableDeclaration :
    BindingIdentifier [Initializer]
    BindingPattern Initializer
```

> `var` has not been recommended to be used since ES6+ due to
>
> * global/function-wise scope:
>
> ```js
> var a = "foo";    // Global Scope
> 
> function print2dArray(array) {    // Function Scope
>   for (var i = 0; i < array.length; i++) {
>   // Function-wise variable `i` declared
>     var row = array[i];
>     for (var i = 0; i < row.length; i++) {
>     // Another function-wise variable `i` is declared,
>     // which is allowed, and refer to the same `i` in outer loop
>       console.log(row[i]);
>     }
>   }
> }
> 
> print2dArray([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
> // 1, 2, 3
> // which is not expected
> ```
>
> * variable hoisting:
>
> ```js
> console.log(foo);     // undefined, no error will be throwed
> 
> var foo = "bar";
> 
> console.log(foo);     // "bar", which is reasonable
> ```
>
> **Hoisting** means that variable declared with `var`
> will be initialized to `undefined` when its scope is
> instantiated, and the value will be assigned in assignment
> expression. Upper code snippet equals to
> ```js
> var foo;
> 
> console.log(foo);
> 
> foo = "bar";
> 
> console.log(foo);
> ```

**examples:**

This part illustrate the basic usage of declaring variables using `var`.

* A simple variable declaration with `var`

```js
var foo;
```

```yaml
name: usingVar
filter: variable
entities:
    -   name: foo
        loc: [ 1, 5 ]
        kind: var
```

### Object structure

```ts
interface variableE {

}
```
