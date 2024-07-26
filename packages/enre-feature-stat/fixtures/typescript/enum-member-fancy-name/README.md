# Enum Member Fancy Name

## Patterns (7)

> Ref: [Test Case](../../../../../docs/entity/enum-member.md#corner-cases)

```ts
enum CornerCase {
    // Valid cases
    'StringLiteral',
    '✅',
    '1e20',
    '0x123',
    '100_000',

    // Invalid cases
    '123',
    '123.456',
}
```

## Metrics

* #Usage%(Enum Member)

## Tags

* static
