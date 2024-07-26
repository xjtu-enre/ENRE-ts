# Const Type Parameter

## Patterns (3)

> Ref:
> [Test Case](../../../../../docs/entity/type-parameter.md#syntax-const-type-parameter)

```ts
// Class
class Clz<const T, S> {
    // Method
    foo<const U>() {
        /* Empty */
    }
}

// Function
function bar<const V>() {
    /* Empty */
}
```

## Metrics

* #Usage%(Type Parameter)

## Tags

* typing
* new(TS5.0)
