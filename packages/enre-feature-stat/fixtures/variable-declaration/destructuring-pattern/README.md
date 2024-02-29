# Destructuring Pattern in Variable Declaration

## Patterns

```js
//    Not a destructuring pattern
//    v
const a = 1;

//    An object destructuring pattern
//    vvvvvv
const {a, b} = obj;

//    An array destructuring pattern
//    vvvvvv
const [a, b] = arr;

for (const [a, b] of Object.entries(obj)) {
    /* Empty */
}

for (const {a, b} in obj) {
    /* Empty */
}
```

## Metrics

* #Usage%(Variable Declarations)
* MaxCount(Destructuring Pattern Nesting Depth)
* Types(InForStatement, NotInForStatement): (supports for-in & for-of)
    * InForStatement: This destructuring pattern is used in a for statement.
    * NotInForStatement: This destructuring pattern is not used in a for statement.

## Tags

* static
