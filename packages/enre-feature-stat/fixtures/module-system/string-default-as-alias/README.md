# String `default` as Alias

## Patterns

> Ref: [Test Case](../../../../../docs/relation/export.md#reexports-make-default-export)

[//]: # (@formatter:off)
```js
export {a as 'default'} from './file0.js';
/**
 * The default export still works even for string literal
 * that can be evaluated as `default`.
 */
```
[//]: # (@formatter:on)

## Metrics

* #Usage%
