# Use `this` in Function Body

## Patterns (3)

This is intended to refer to the feature `using function as constructor`.

```js
function Foo() {
    // Add properties to `this`
    //vvvvvvv
    this.prop = 1;
}

// If the function is called with `new` keyword, `this` is the 
// newly created object
//          vvv
const foo = new Foo();

// If the function is called without `new` keyword, `this` is the
// global object, which is probably a mistake
//          vvv
const bar = Foo();
```

Using `this` inside a class method or an arrow function cannot have the effect.

```js
// Class context
class Clz {
    // This should not be matched
    //vv
    mthd() {
        this.foo = 0;
    }
}

// Arrow function statically captures enclosing `this`
const foo = () => {
    this.a = 1
}
//                 ^^^^
// `this` will always refer to globalThis
// `new foo()` is also an invalid expression
```

## Metrics

* #Usage%(FunctionDeclaration/FunctionExpression)
* Type{CalledWithNew, CalledWithoutNew}
    * CalledWithNew: The function is called with `new` keyword
    * CalledWithoutNew: The function is called without `new` keyword

## Tags

* implicit
* dynamic
