# Decorator Returns a New Function

## Patterns

```js
function replaced() {
    // In a decorator function, a new entity is returned
    //     vvvvvvvvvvvvvvvv
    return function foo() {
        /* Empty */
    }
}

class Bar {
    // When `bar` is called, it is replacing function `foo` been called
    // vvvvvvvvvv
    @replaced bar() {
        /* Empty */
    }
}
```

## Metrics

* #Usage%
