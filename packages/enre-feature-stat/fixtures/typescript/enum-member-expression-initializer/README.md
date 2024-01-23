# Enum Member Expression Initializer

## Patterns

> Ref:
> [Test Case](../../../../../docs/entity/enum-member.md#constant-expressions-as-initializers)

```ts
enum FileAccess {
    // constant members
    //     vvvvvv
    Read = 1 << 1,
    //      vvvvvv
    Write = 1 << 2,
    //          vvvvvvvvvvvv
    ReadWrite = Read | Write,
    // computed member
    //  vvvvvvvvvvvv
    G = "123".length,
}
```

## Metrics

* #Usage%
