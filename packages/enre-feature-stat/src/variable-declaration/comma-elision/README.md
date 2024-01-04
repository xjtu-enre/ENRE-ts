# Comma Elision in Variable Desctructuring

## Patterns

```js
// The first element is elided
//     v
const [, a] = [1, 2];

// In old times, people usually do this. Though this is not comma
// elision syntax, it is still an interesting pattern.
//     v
const [_, b] = [1, 2];
```

## Metrics

* #Usage% (Comparing to all variable declarations)
* Max Elision Count
