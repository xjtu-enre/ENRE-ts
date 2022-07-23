## Entity: Interface

An `Interface Entity` is a name and parameterized representation
of an object type and can be implemented by classes.

### Supported Pattern

```yaml
name: Interface declaration
```

#### Syntax: Interface Declarations

```text
InterfaceDeclaration :
    `interface` BindingIdentifier [TypeParameters] [InterfaceExtendsClause] ObjectType

InterfaceExtendsClause :
    `extends` ClassOrInterfaceTypeList

ClassOrInterfaceTypeList :
    ClassOrInterfaceType
    ClassOrInterfaceTypeList `,` ClassOrInterfaceType

ClassOrInterfaceType :
    TypeReference
```

##### Examples

###### Simple interface declaration

```ts
interface Foo {
    /* Empty */
}
```

```yaml
name: Simple interface declaration
entity:
    type: interface
    extra: false
    items:
        -   name: Foo
            loc: 1:11
```

#### Semantic: Declaration Merging

`interface` is **open-ended**, which means enums with same
qualified name under the same scope will be merged into a single
one interface.

**Restrictions:**

#### Semantic: Merging With The Class Type

As mentioned
in [here](./class.md#semantic-typescript-class-types), a class
declaration creates its own type, it is also possible to create
an interface with the same identifier as the class in advance, in
which case declarations will be merged.

##### Examples

###### Class and interface merging

```ts
//// @no-test
interface Foo {
    prop0: number,
}

class Foo {
    prop1: string = '';
}

type ReferenceProp0 = Foo['prop0'];
type ReferenceProp1 = Foo['prop1'];
```

```yaml
name: Class and interface merging
entity:
    items:
        -   name: Foo
            loc: 1:11
            type: interface
        -   name: Foo
            loc: 5:7
            type: class
        -   name: prop0
            qualified: Foo.prop0
            loc: 2:5
            type: property
        -   name: prop1
            qualified: Foo.prop1
            loc: 6:5
            type: field
```
