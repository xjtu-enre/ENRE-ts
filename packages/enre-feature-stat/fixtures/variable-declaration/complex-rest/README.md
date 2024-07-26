# Complex Rest Destructuring

Only available in array destructuring.

## Patterns (4)

```js
// Nesting depth is 3
const [...[a, {b, c: {d}}]] = arr;

// Nesting depth is 1
const [a, ...[b]] = arr;

// Not complex rest destructuring
const [a, ...b] = arr;

// Cannot be used in object destructuring
const {a, ...b} = obj;
```

## Metrics

* #Usage%(Variable Array Destructuring Rest Operator)
* MaxCount(Rest Destructuring Pattern Nesting Depth)

## Tags

* static
