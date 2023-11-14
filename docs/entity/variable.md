## Entity: Variable

A `Variable Entity` is a variable defined by keywords `let`/`const`/`var`.

### Supported Patterns

```yaml
name: Variable declaration
```

#### Syntax: Let and Const Declarations

```text
LexicalDeclaration :
    LetOrConst BindingList `;`

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
    `yield` /* Only permitted in the grammar */
    `await` /* Only permitted in the grammar */
```

##### Examples

This part illustrates the basic usage of declaring variables using `let`/`const`.

###### A simple variable declaration with `let`

```js
let foo0;

let foo1 = "bar";
```

```yaml
name: Using let
entity:
    type: variable
    extra: false
    items:
        -   name: foo0
            loc: 1:5
            kind: let
        -   name: foo1
            loc: 3:5
            kind: let
```

###### A simple variable declaration with `const`

Once the `const` variable is defined, any further re-assignment will not be allowed.

```js
const foo = "bar";

// foo = "bar1";   // TypeError: Assignment to constant variable.
```

```yaml
name: Using const
entity:
    type: variable
    extra: false
    items:
        -   name: foo
            loc: 1:7
            kind: const
```

###### Declare multiple variables in a single line of code

```js
let a, b, c = "bar";
// Only variable`c` is assigned with string literal "bar"
```

```yaml
name: Multiple vars in single line
entity:
    type: variable
    extra: false
    items:
        -   name: a
            loc: 1:5
            kind: let
        -   name: b
            loc: 1:8
            kind: let
        -   name: c
            loc: 1:11
            kind: let
```

#### Syntax: Destructuring Binding Patterns

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

##### Examples

This part illustrates the usage of destructuring assignment.

###### Simple object destructuring assignment

```js
let {a, b, c} = {a: 1, b: 2, c: 3, d: 4};
// `a`, `b`, `c` equals to 1, 2, 3 respectively
// Note that `d` in the right side is omitted
```

```yaml
name: Object destructuring
entity:
    type: variable
    extra: false
    items:
        -   name: a
            loc: 1:6
            kind: let
        -   name: b
            loc: 1:9
            kind: let
        -   name: c
            loc: 1:12
            kind: let
```

###### Simple array destructuring assignment

```js
let [a, b, c] = [1, 2, 3, 4];
// `a`, `b`, `c` equals to 1, 2, 3 respectively
```

```yaml
name: Array destructuring
entity:
    type: variable
    extra: false
    items:
        -   name: a
            loc: 1:6
            kind: let
        -   name: b
            loc: 1:9
            kind: let
        -   name: c
            loc: 1:12
            kind: let
```

###### Destructuring but save nothing

```js
let {} = {a: 1, b: 2};

let [] = [1, 2];
```

```yaml
name: Destructuring but dont save
entity:
    type: variable
    extra: false
    items: [ ]
```

###### Array destructuring with comma elision

```js
let [, , a] = [1, 2, 3, 4];
// `a` equals to 3 since 2 comma appear before itself

let [, , b] = [1, 2];
// Initializer's lengther doesn't matter, `b` will be undefined
```

```yaml
name: Array destructuring with comma elision
entity:
    type: variable
    extra: false
    items:
        -   name: a
            loc: 1:10
            kind: let
        -   name: b
            loc: 4:10
            kind: let
```

###### Destructuring with `rest` operator

```js
let {a, b, ...r} = {a: 1, b: 2, c: 3, d: 4};
// `r` is { c: 3, d: 4 }

let [x, y, ...z] = [1, 2, 3, 4];
// `z` is [3, 4]

let [, , ...i] = [1, 2, 3, 4];
// `i` is [3, 4], but not [1, 2, 3, 4]
```

```yaml
name: Destructuring with rest operator
entity:
    type: variable
    extra: false
    items:
        -   name: a
            loc: 1:6
            kind: let
        -   name: b
            loc: 1:9
            kind: let
        -   name: r
            loc: 1:15
            kind: let
        -   name: x
            loc: 4:6
            kind: let
        -   name: y
            loc: 4:9
            kind: let
        -   name: z
            loc: 4:15
            kind: let
        -   name: i
            loc: 7:13
            kind: let
```

###### Pattern can also be in `rest`

> ONLY available in **array destructuring**.

```js
let [a, b, ...[{c}]] = [1, 2, {c: 3}]
// `c` equals to 3
```

```yaml
name: Nested rest
entity:
    type: variable
    extra: false
    items:
        -   name: a
            loc: 1:6
            kind: let
        -   name: b
            loc: 1:9
            kind: let
        -   name: c
            loc: 1:17
            kind: let
```

###### Complex object destructuring

```js
let {a, b, c: {d}} = {a: 1, b: 2, c: {d: 3}};
// `a`, `b`, `d` equals to 1, 2, 3 respectively
// Note that `c` will be neither declared nor assigned
```

```yaml
name: Multi layer object destructuring
entity:
    type: variable
    extra: false
    items:
        -   name: a
            loc: 1:6
            kind: let
        -   name: b
            loc: 1:9
            kind: let
        -   name: d
            loc: 1:16
            kind: let
```

###### Mixed object and array destructuring

```js
let {a, b: [c, d]} = {a: 1, b: [2, 3]};

let [{foo}, {bar}] = [{foo: 1, alpha: 3}, {bar: 2, beta: 4}]
```

```yaml
name: Mixed destructuring
entity:
    type: variable
    extra: false
    items:
        -   name: a
            loc: 1:6
            kind: let
        -   name: c
            loc: 1:13
            kind: let
        -   name: d
            loc: 1:16
            kind: let
        -   name: foo
            loc: 3:7
            kind: let
        -   name: bar
            loc: 3:14
            kind: let
```

###### Destructuring assignment with default value

```js
const {d: a = 1, b = 2, c} = {a: 11, c: 13, d: 14};
// `a`, `b`, `c` equals to 14, 2, 13 respectively
// Note that the default value of `a` is overrode

// If no default value is set, `undefined` will be returned
const {foo, bar = 1} = {bar: 11};
// `foo` equals to `undefined`

const [x = 1] = [];
```

```yaml
name: Destructuring with default value
entity:
    type: variable
    extra: false
    items:
        -   name: a
            loc: 1:11
            kind: const
        -   name: b
            loc: 1:18
            kind: const
        -   name: c
            loc: 1:25
            kind: const
        -   name: foo
            loc: 6:8
            kind: const
        -   name: bar
            loc: 6:13
            kind: const
        -   name: x
            loc: 9:8
            kind: const
```

#### Syntax: Variable Statement

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
> **Hoisting** means that variable declared with `var` will be initialized to `undefined`
> when its scope is instantiated, and the value will be assigned in assignment expression.
> Upper code snippet equals to
>
> ```js
> var foo;
> 
> console.log(foo);
> 
> foo = "bar";
> 
> console.log(foo);
> ```

##### Examples

This part illustrates the basic usage of declaring variables using `var`.

###### A simple variable declaration with `var`

```js
var foo;
```

```yaml
name: Using var
entity:
    type: variable
    extra: false
    items:
        -   name: foo
            loc: 1:5
            kind: var
```

### Properties

| Name | Description                      |              Type               | Default |
|------|----------------------------------|:-------------------------------:|:-------:|
| kind | The scoping kind of the variable | `'let'` \| `'const'` \| `'var'` |    -    |
