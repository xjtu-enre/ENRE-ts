# ENRE-capturable entity categories in JS/TS

> Reference: https://tc39.es/ecma262

## Variable

A `Variable Entity` is a variable defined by keywords `let`/`const`/`var`.

### Supported pattern

**Syntax:**

```markdown
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

1. A simple variable declaration with `let`

```js
let foo0;

let foo1 = "bar";
```

2. A simple variable declaration with `const`

Once the `const` variable is defined, any further re-assignment will not be allowed.

```js
const foo = "bar";

foo = "bar1";   // TypeError: Assignment to constant variable.
```

3. Declare multiple variables in a single line of code
```js
let a, b, c = "bar";
// Only variable`c` is assigned with string literal "bar"
```

**Syntax:**

```markdown
BindingPattern :
    *ObjectBindingPattern*
    *ArrayBindingPattern*

ObjectBindingPattern :
    { }
    { *BindingRestProperty* }
    { *BindingPropertyList* }
    { *BindingPropertyList* , *[BindingRestProperty]* }

ArrayBindingPattern :
    \[ *Elision* *[BindingRestElement]* \]
    \[ *BindingElementList* \]
    \[ *BindingElementList* , *Elision* *[BindingRestElement]* \]

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

4. Simple object destructuring assignment

```js
let { a, b, c } = { a: 1, b: 2, c: 3, d: 4 }
// `a`, `b`, `c` equlas to 1, 2, 3 respectively
// Note that `d` in the right side is emitted
```

5. Simple array destructuring assignment

```js
let [a, b, c] = [1, 2, 3, 4]
// `a`, `b`, `c` equals to 1, 2, 3 respectively
```

6. Object destructuring with `rest` operator

```js
let { a, b, ...r } = { a: 1, b: 2, c: 3, d: 4 }
// `r` equals to { c: 3, d: 4 }
```

7. Complex object destructuring

```js
let { a, b, c: { d } } = { a: 1, b: 2, c: { d: 3 } }
// `a`, `b`, `d` equals to 1, 2, 3 respectively
// Note that `c` will not be declared & assigned
```

8. Destructuring assignment with default value

```js
let { a = 1, b = 2, c } = { a: 11, c: 13, d: 14 }
// `a`, `b`, `c` equals to 11, 2, 13 respectively
// Note that the default value of `a` is overrided

// If no default value is set, `undefined` will be returned
let { foo, bar = 1 } = { bar: 11 }
// `foo` equals to `undefined`
```

**Syntax:**

```markdown
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
> * global/function-wise scope:
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
> print2dArray([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
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
