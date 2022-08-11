## Relation: Use

A `Use Relation` establishes a link between an upper entity and
any other entities that appear on its scope for real purpose.

### Supported Patterns

```yaml
name: Relation use
```

#### Syntax: Use

```text
A symbol shows up in a place where does not form any other relations.
```

##### Examples

###### Use symbols from declaration merge-able entities

```ts
const a = 2;
const b = 4;

enum Foo {
    a = 1,
    b,
}

enum Foo {
    c = a & b,
    d,
}
```

```yaml
name: Use symbols from declaration merge-able entities
relation:
    type: use
    extra: false
    items:
        -   from: enum:'Foo'
            to: enum member:'Foo.a'
            loc: file0:10:9
        -   from: enum:'Foo'
            to: enum member:'Foo.b'
            loc: file0:10:13
        -   from: file:'file0'
            to: variable:'a'
            loc: file0:10:9
            negative: true
        -   from: file:'file0'
            to: variable:'b'
            loc: file0:10:13
            negative: true
```
