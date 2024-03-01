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

// Nesting depth is 4
var {a, b: [c, {d: [e]}]} = obj;

// Nesting depth is 3
let [a, {b, c: [d]}] = arr;
```

## Metrics

* #Usage%(Variable Declarations)
* MaxCount(Non-Rest Destructuring Pattern Nesting Depth)
* Types(InForStatement, NotInForStatement): (Supports for-in & for-of)
    * InForStatement: This destructuring pattern is used in a for statement.
    * NotInForStatement: This destructuring pattern is not used in a for statement.

## Tags

* static
