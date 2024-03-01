# Comma Elision in Variable Destructuring

## Patterns

```js
// The first element is elided
//     v
const [, a] = [1, 2];

// In old times, people usually do this. Though this is not comma
// elision syntax, it is still an interesting pattern.
//     v
const [_, b] = [1, 2];

// We also gather names which is not used (non-def-used elements)
//     v     vv All not used, and can be replaced with elision syntax
const [_, c, __] = [1, 2, 3, 4];
//        ^ v Used element
console.log(c);
```

## Metrics

* #Usage%(Variable Array Destructuring Usage)
* MaxCount(Elision Count)
* Types{CommaElision, PseudoElision}:
    * CommaElision: This destructuring pattern uses comma elision syntax.
    * PseudoElision: This destructuring pattern uses name elision rules.

## Tags

* static
