# Decorator Returns a New Function

This feature only analyze the latest `2022-03` version of the decorator proposal.

## Patterns

Decorator returns a new element.

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

Decorator does not return a new element.

```js
function notAUsedDecorator() {
    return function foo() {
        /* Empty */
    }
}

function deced(elem) {
    return elem
}

class Bar {
    @deced bar() {
        /* Empty */
    }
}
```

## Metrics

* #Usage%(User-Defined Decorator Function)

## Tags

* dynamic
* implicit
* stage-3(TS5.0)
