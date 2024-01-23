# Overridden Type Parameter

## Patterns

> Ref:
> [Test Case](../../../../../docs/entity/type-parameter.md#duplicated-type-parameter-names)

```ts
class Clz<T> {
    foo<T>(arg: T) {
        /* Empty */
    }

    // The `T` of `arg` is method `foo`'s.
}
```

## Metrics

* #Usage%
