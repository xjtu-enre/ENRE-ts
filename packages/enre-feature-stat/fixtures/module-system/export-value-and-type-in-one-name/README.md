# Export Value and Type in One Name

## Patterns

> Ref: [Test Case](../../../../../docs/relation/export.md#auto-infer-based-on-context)

```ts
const foo = 1;

interface foo {
    /* Empty */
}

// Both variable foo and interface foo are exported
export {foo};
```

## Metrics

* #Usage%
