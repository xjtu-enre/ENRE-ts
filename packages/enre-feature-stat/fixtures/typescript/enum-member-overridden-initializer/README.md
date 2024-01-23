# Enum Member Overridden Initializer

## Patterns

> Ref:
> [Test Case](../../../../../docs/entity/enum-member.md#numeric-enum-member-with-partial-initializers)

```ts
enum Foo {
    // First use default
    //vvv
    Alpha,          // 0, by default
    //   vvv
    Beta = 2,       // 2, set by initializer
    Gamma,          // 3, auto-incremented
}
```

## Metrics

* #Usage%
