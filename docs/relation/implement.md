## Relation: Implement

An `Implement Relation` establishes a constraint (type checking)
on `Class Entity` according to `Interface Entity`'s declarations.

### Supported Patterns

```yaml
name: Implement declaration
```

#### Syntax: Implement Declaration

```text
ClassHeritage :
    [ClassExtendsClause] [ImplementsClause]

ImplementsClause :
    `implements` ClassOrInterfaceTypeList

ClassOrInterfaceTypeList :
    ClassOrInterfaceType
    ClassOrInterfaceTypeList `,` ClassOrInterfaceType

ClassOrInterfaceType :
    TypeReference
```

When `extends` and `implements` are both used, `extends` must
precede `implements`.

##### Examples

###### Class implements TypeScript interface

```ts
interface Foo {
    prop0: number;
}

class Bar implements Foo {
    // All properties in interface have to be implemented
    prop0: number;
}
```

```yaml
name: Class implements interface
relation:
    type: implement
    extra: false
    items:
        -   from: class:'Bar'
            to: interface:'Foo'
            loc: file0:5:22
```

###### Class implements multiple interfaces

When a class is implementing multiple interfaces, it needs to
implement all properties of those interfaces.

```ts
interface Foo {
    prop0: number;
}

interface Bar {
    prop1: string;
}

class Baz implements Foo, Bar {
    prop0: number;
    prop1: string;
}
```

```yaml
name: Class implements multiple interfaces
relation:
    type: implement
    extra: false
    items:
        -   from: class:'Baz'
            to: interface:'Foo'
            loc: file0:9:22
        -   from: class:'Baz'
            to: interface:'Bar'
            loc: file0:9:27
```

###### Class implements class

Since class in TypeScript introduces its own class type, it is
also possible for a class to implement that class type.

```ts
class Foo {
    prop0: number;
}

class Bar implements Foo {
    prop0: number;
}
```

```yaml
name: Class implements class
relation:
    type: implement
    extra: false
    items:
        -   from: class:'Bar'
            to: class:'Foo'
            loc: file0:5:22
```
