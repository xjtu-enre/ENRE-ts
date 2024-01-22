# `this` in Parameter

`this` is not a valid JavaScript parameter name, TypeScript utilizes this feature for
explicitly typing `this` variable in functions.

## Patterns

```ts
//           vvvvvvvvvv
function foo(this: Type) {
    /* Empty */
}
```

```ts
class Parent {
    /* Empty */
}

class Child extends Parent {
    //  vvvvvvvvvvvv
    foo(this: Parent) {
        /* Empty */
    }
}
```

## Metrics

* #Usage%
* Context (Is function or method or arrow function, however arrow function is not
  possible)
* Index (Expected to be first)
* Type (If it is a method, does the type of `this` the same as the class)
