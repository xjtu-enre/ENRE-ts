# String Export Alias

TypeScript still (TS5.4) does not support this ECMAScript feature.

https://github.com/microsoft/TypeScript/issues/40594

## Patterns

> Ref:
> [Test Case](../../../../../docs/relation/import.md#named-import-rename-string-literals-to-valid-identifiers)

[//]: # (@formatter:off)
```js
const variable = 0;

export {variable as 'a-not-valid-identifier'};
```

```js
import {'a-not-valid-identifier' as variable} from './file0.js';

console.log(variable);
```
[//]: # (@formatter:on)

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

## Tags

* static
