# Computational Export

Computational export can only be used within a default export.

## Patterns

> Ref:
> [Test Case](../../../../../docs/relation/export.md#default-export-identifier-and-assignment-expressions)

```js
let a = 1;
export default a++;
//             ^^^
// Can be more complicated

export default foo();

export default new Bar();
```

## Metrics

* #Usage%(Export Declaration)

## Tags

* dynamic
