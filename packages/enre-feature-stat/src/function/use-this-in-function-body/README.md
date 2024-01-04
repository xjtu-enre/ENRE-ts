# Use `this` in Function Body

## Patterns

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

## Metrics

* #Function Count%
