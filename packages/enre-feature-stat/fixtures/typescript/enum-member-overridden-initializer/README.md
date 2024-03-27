# Enum Member Overridden Initializer

## Patterns

Override default with simple literal.

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

Override default with static expression.

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

* #Usage%(Enum Member)
* Types{Literal, Expression}
    * Literal: The enum member is initialized with a simple literal.
    * Expression: The enum member is initialized with a static expression.
* Types{PartialInit, FullInit}
    * PartialInit: Only part of enum members of an enum are initialized.
    * FullInit: All enum members of an enum are initialized.

## Tags

* static
