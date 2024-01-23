# String Export Alias

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

## Mwtrics

* #Usage%
