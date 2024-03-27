# `import` Function

## Patterns

```js
const foo = await import('module', {type: 'json'});

async function bar() {
    await import('a' + 'b')
}
```

## Metrics

* #Usage%(Import Declaration/Function Call)
* Types{InTopLevel, NotInTopLevel}
    * InTopLevel: The import function call is in top level
    * NotInTopLevel: The import function call is not in top level
* Types{ArgTypes}

## Tags

* dynamic
