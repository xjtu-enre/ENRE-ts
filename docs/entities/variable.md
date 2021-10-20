## Entity: Variable

A `Variable Entity` is a variable defined by keywords `let`/`const`/`var`.

### Supported pattern

> cn = variableDeclaration

**Syntax:**

```text
LexicalDeclaration :
    *LetOrConst* *BindingList* ;

LetOrConst :
    let
    const

BindingList :
    *LexicalBinding*
    *BindingList* , *LexicalBinding*

LexicalBinding :
    *BindingIdentifier* *[Initializer]*
    *BindingPattern* *Initializer*

BindingIdentifier :
    *Identifier*
    yield
    await
```

**Examples:**

This part illustrate the basic usage of declaring variables using `let`/`const`.

* A simple variable declaration with `let`

> cn = usingLet

```js
let foo0;

let foo1 = "bar";
```

* A simple variable declaration with `const`

Once the `const` variable is defined, any further re-assignment will not be allowed.

> cn = usingConst

```js
const foo = "bar";

// foo = "bar1";   // TypeError: Assignment to constant variable.
```

* Declare multiple variables in a single line of code

> cn = multiVarsInOneLine

```js
let a, b, c = "bar";
// Only variable`c` is assigned with string literal "bar"
```

**Syntax:**

```text
BindingPattern :
    *ObjectBindingPattern*
    *ArrayBindingPattern*

ObjectBindingPattern :
    { }
    { *BindingRestProperty* }
    { *BindingPropertyList* }
    { *BindingPropertyList* , *[BindingRestProperty]* }

ArrayBindingPattern :
    \[ *[Elision]* *[BindingRestElement]* \]
    \[ *BindingElementList* \]
    \[ *BindingElementList* , *[Elision]* *[BindingRestElement]* \]

BindingRestProperty :
    ... *BindingIdentifier*

BindingPropertyList :
    *BindingProperty*
    *BindingPropertyList* , *BindingProperty*

BindingElementList :
    *BindingElisionElement*
    *BindingElementList* , *BindingElisionElement*

BindingElisionElement :
    *[Elision]* *BindingElement*

BindingProperty :
    *SingleNameBinding*
    *PropertyName* : *BindingElement*

BindingElement :
    *SingleNameBinding*
    *BindingPattern* *[Initializer]*

SingleNameBinding :
    *BindingIdentifier* *[Initializer]*

BindingRestElement :
    ... *BindingIdentifier*
    ... *BindingPattern*
```

**Examples:**

This part illustrate the usage of destructuring assignment.

* Simple object destructuring assignment

> cn = objectDestructuring

```js
let {a, b, c} = {a: 1, b: 2, c: 3, d: 4};
// `a`, `b`, `c` equlas to 1, 2, 3 respectively
// Note that `d` in the right side is emitted
```

* Simple array destructuring assignment

> cn = arrayDestructuring

```js
let [a, b, c] = [1, 2, 3, 4];
// `a`, `b`, `c` equals to 1, 2, 3 respectively
```

* Array destructuring with comma elision

> cn = arrayCommaElision

```js
let [, , a] = [1, 2, 3, 4];
// `a` equals to 3 since 2 comma appear before itself

let [, , b] = [1, 2];
// Initializer's lengther doesn't matter, `b` will be undefined
```

* Object destructuring with `rest` operator

> cn = desWithRestOperator

```js
let {a, b, ...r} = {a: 1, b: 2, c: 3, d: 4};
// `r` equals to { c: 3, d: 4 }
```

* Complex object destructuring

> cn = complexObjectDes

```js
let {a, b, c: {d}} = {a: 1, b: 2, c: {d: 3}};
// `a`, `b`, `d` equals to 1, 2, 3 respectively
// Note that `c` will not be declared & assigned
```

* Mixed object and array destructuring

> cn = mixedDestructuring

```js
let {a, b: [c, d]} = {a: 1, b: [2, 3]};

let [{foo}, {bar}] = [{foo: 1, alpha: 3}, {bar: 2, beta: 4}]
```

* Destructuring assignment with default value

> cn = desWithDefaultValue

```js
let {a = 1, b = 2, c} = {a: 11, c: 13, d: 14};
// `a`, `b`, `c` equals to 11, 2, 13 respectively
// Note that the default value of `a` is overrode

// If no default value is set, `undefined` will be returned
let {foo, bar = 1} = {bar: 11};
// `foo` equals to `undefined`
```

**Syntax:**

```text
VariableStatement :
    var *VariableDeclarationList* ;

VariableDeclarationList :
    *VariableDeclaration*
    *VariableDeclarationList* , *VariableDeclaration*

VariableDeclaration :
    *BindingIdentifier* *[Initializer]*
    *BindingPattern* *Initializer*
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

### Object structure

```ts
interface variableE {

}
```
