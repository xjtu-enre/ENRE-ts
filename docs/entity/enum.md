## Entity: Enum

An `Enum Entity` is a set of named constants for document intent,
or create a set of distinct cases.

> Enum is a non-type feature that TypeScript adds to ECMAScript,
> and in general, enums will be preserved to the runtime.

### Supported pattern

```yaml
name: enumDeclaration
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

**Examples:**

* Simple enum declaration

```ts
enum Foo {
    /* Empty */
}
```

```yaml
name: simpleEnumDeclaration
entities:
    filter: enum
    exact: true
    items:
        -   name: Foo
            loc: [ 1, 6 ]
```

* Const enum declaration

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
name: constEnumDeclaration
entities:
    filter: enum
    exact: true
    items:
        -   name: Foo
            loc: [ 1, 12 ]
            kind: const
```
