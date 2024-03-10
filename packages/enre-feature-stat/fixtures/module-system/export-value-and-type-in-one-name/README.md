# Export Value and Type in One Name

## Patterns

> Ref: [Test Case](../../../../../docs/relation/export.md#auto-infer-based-on-context)

```ts
const foo = 1;

interface foo {
    /* Empty */
}

const [c, {d}, ...[e]] = arr;

interface c {
    /* Empty */
}

interface d {
    /* Empty */
}

interface e {
    /* Empty */
}

function bar() {
    /* Empty */
}

interface bar {
    /* Empty */
}

namespace Baz {
    export const a = 1;
}

type Baz = { a: number }

export {foo, bar, Baz, c, d, e as f};
```

Pair `Class-Interface` belongs to **Declaration Merging**.

## Metrics

* #Usage%(Export Name)

## Tags

* static

