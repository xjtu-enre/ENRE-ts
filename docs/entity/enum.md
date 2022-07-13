## Entity: Enum

An `Enum Entity` is a set of named constants for document intent,
or create a set of distinct cases.

> Enum is a non-type feature that TypeScript adds to ECMAScript,
> and in general, enums will be preserved to the runtime.

### Supported Pattern

```yaml
name: Enum declaration
```

#### Syntax: Enum Definitions

```text
EnumDeclaration:
    [const] `enum` BindingIdentifier `{` [EnumBody] `}`

EnumBody:
    [EnumMemberList] [`,`]

EnumMemberList:
    EnumMember
    EnumMemberList `,` EnumMember

EnumMember:
    PropertyName
    PropertyName `=` EnumValue

EnumValue:
    AssignmentExpression
```

##### Examples

###### Simple enum declaration

```ts
enum Foo {
    /* Empty */
}
```

```yaml
name: Simple enum declaration
entity:
    type: enum
    extra: false
    items:
        -   name: Foo
            loc: [ 1, 6 ]
```

###### Const enum declaration

Const enums are enum that will not be preserved until compilation
time, in contrast, they will be inlined at use sites, hence, no
computed members are allowed.

> See
> [this documentation](https://www.typescriptlang.org/docs/handbook/enums.html#const-enums)
> to learn more about the const enum.

```ts
const enum Foo {
    /* Empty */
}
```

```yaml
name: Const enum declaration
entity:
    type: enum
    extra: false
    items:
        -   name: Foo
            loc: [ 1, 12 ]
            const: true
```

#### Semantic: Declaration Merging

`enum` is **open-ended**, which means enums with same qualified
name under the same scope will be merged into a single one enum.

**Restrictions:**

1. Automatic numbering sequence will not be inherited across
   multiple definitions;

2. Only one of the definitions can omit the initializer of its
   first member;

3. All declarations should all be modified by `const` or not.

##### Examples

###### Declaration merging

```ts
enum NumberWord {
    zero,
    one,
}

enum NumberWord {
    six = 6,        // This initializer is necessary

    /**
     * Since multiple declarations will be merged,
     * it is natural for an initializer to refer
     * to an enum member defined not in current body
     */
    seven = six + one,
}

enum NumberWord {
    two = 2,        // This initializer is necessary
    three,          // = 3, automatic numbering is working normally
}
```

```yaml
name: Enum declaration merging
entity:
    extra: false
    type: enum member
    items:
        -   name: NumberWord
            loc: [ 1, 6 ]
            type: enum
        -   name: zero
            loc: [ 2, 5 ]
            value: 0
        -   name: one
            loc: [ 3, 5 ]
            value: 1
        -   name: two
            loc: [ 18, 5 ]
            value: 2
        -   name: three
            loc: [ 19, 5 ]
            value: 3
        -   name: six
            loc: [ 7, 5 ]
            value: 6
        -   name: seven
            loc: [ 14, 5 ]
            value: 7
```
