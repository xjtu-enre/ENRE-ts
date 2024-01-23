# Const Enum

Const enum usages got compiled to correlated values, if the enum declaration is changed
during update, the compiled values may point to wrong enum members.

## Patterns

> Ref: [Test Case](../../../../../docs/entity/enum.md#const-enum-declaration)

```ts
//vvv
const enum Foo {
    a = 0,
    b,
}

// Usage
function foo(x: Foo) {
    /* Empty */
}

foo(Foo.a);
foo(0); // Foo.a is compiled to value

foo(2); // Invalid
```

## Metrics

* #Usage%
* Callsites that pass value rather than enum member
