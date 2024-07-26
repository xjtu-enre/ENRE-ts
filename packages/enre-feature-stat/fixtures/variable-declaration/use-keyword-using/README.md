# Use Keyword `using`

Variables declared with `using` keyword are automatically disposed when they go out of
scope, at when the dispose function is invoked.

## Patterns (2)

> Ref: [Test Case](../../../../../docs/entity/variable.md#syntax-using-declaration)

[//]: # (@formatter:off)
```js
using foo = new Foo();

await using bar = new Bar();
```
[//]: # (@formatter:on)

## Metrics

* #Usage%(Variable Declaration)

## Tags

* stage-3(TS5.2)
* static
* implicit
