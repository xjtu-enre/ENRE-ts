# Dynamic Heritage

## Patterns

This feature includes the following patterns:

```js
function wrapper(superClz) {
    // Super class comes from dynamic parameter
    //                   vvvvvvvv
    return class extends superClz {
        /* Empty */
    };
}
```

```js
// Super class comes from expression evaluation
//                vvvvv
class Foo extends exp() {
    /* Empty */
}
```

Although two listed above may not be the only patterns, we are sure the following static
patterns are not included:

```js
class Parent {
    /* Empty */
}

// Explicitly extends from a class (including importing from other modules)
//                  vvvvvv
class Child extends Parent {
    /* Empty */
}
```

## Metrics

* #Usage%
