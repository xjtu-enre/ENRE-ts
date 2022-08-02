## Entity: Type Alias

A `Type Alias Entity` is a convenient alias for a compound type.

### Supported Patterns

```yaml
name: Type alias declaration
```

#### Syntax: Type Alias Declaration

```text
Declaration :
    TypeAliasDeclaration

TypeAliasDeclaration :
    `type` BindingIdentifier [TypeParameters] `=` Type `;`

Type :
    UnionOrIntersectionOrPrimaryType
    FunctionType
    ConstructorType

...

More on https://github.com/microsoft/TypeScript/blob/main/doc/spec-ARCHIVED.md#a1-types
```

##### Examples

###### Simple type alias declaration

```ts
type foo = number | string;
```

```yaml
name: Simple type alias declaration
entity:
    type: type alias
    extra: false
    items:
        -   name: foo
            loc: 1:6
```

###### Generic type alias

```ts
interface Foo<T> {
    prop0: T
}

type bar<T> = Foo<T> | undefined;
```

```yaml
name: Generic type alias
entity:
    type: type alias
    extra: false
    items:
        -   name: bar
            loc: 5:6
```
