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
* Context (Is function or method)
