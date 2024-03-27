# Binary Operators

This feature is meant to cover only modify operators.

## Patterns

> Ref:
> [Test Case](../../../../../docs/relation/modify.md#operators-that-can-perform-modify)

```js
// Normal
a *= 1;
a /= 1;
a %= 1;
a += 1;
a -= 1;
a &= 1;
a ^= 1;
a |= 1;
a **= 1;

// Rare
a <<= 1;        // Left shift assignment
a >>= 1;        // Right shift assignment
a >>>= 1;       // Unsigned right shift assignment

// Short-circuit logical evaluation and assignments
// New in ES2021
a &&= 'aaa'     // Equvalent to a && (a = 'aaa')
a ||= 'aaa'     // Equvalent to a || (a = 'aaa')
a ??= 'aaa'     // Equvalent to a ?? (a = 'aaa')
```

## Metrics

* #Usage(Rare and New Modify Operator)%(Modify Operator)
* Type{Normal, Rare, New}
    * Normal: Normal binary operators
    * Rare: Rarely used binary operators
    * New: New binary operators

## Tags

* static
* new(ES2021)
