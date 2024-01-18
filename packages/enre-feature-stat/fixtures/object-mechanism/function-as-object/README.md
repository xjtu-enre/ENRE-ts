# Function as Object

## Patterns

```js
function foo() {
    /* Empty */
}

// A function is used as part of MemberExpression
//vvvvvvv
foo.bar = 1;
```

```js
class Foo {
    /* Empty */
}

// Class can also be used in the same way
//vvvvvvv
Foo.bar = 1;
```

## Metrics

* #Usage%
