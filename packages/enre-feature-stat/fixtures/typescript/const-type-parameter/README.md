# Const Type Parameter

## Patterns

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

* static
* new(TS5.0)
