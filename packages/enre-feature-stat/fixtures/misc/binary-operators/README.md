# Binary Operators

## Patterns

> Ref:
> [Test Case](../../../../../docs/relation/modify.md#operators-that-can-perform-modify)

```js
a *= 1;
a /= 1;
a %= 1;
a += 1;
a -= 1;
a <<= 1;        // Left shift assignment
a >>= 1;        // Right shift assignment
a >>>= 1;       // Unsigned right shift assignment 
a &= 1;
a ^= 1;
a |= 1;
a **= 1;

// Short-circuit logical evaluation and assignments
// New in ES2021
a &&= 'aaa'     // Equvalent to a && (a = 'aaa')
a ||= 'aaa'     // Equvalent to a || (a = 'aaa')
a ??= 'aaa'     // Equvalent to a ?? (a = 'aaa')
```

## Metrics

* #Usage%(New operator over all operators)

## Tags

* static
* new(ES2021)
