## Entity: Interface

An `Interface Entity` is a name and parameterized representation of an object type and can be implemented by classes.

### Supported Patterns

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

`interface` is **open-ended**, which means interfaces with the same qualified name under the same scope will be merged
into a single one interface.

**Restrictions:**

1. When a generic interface has multiple declarations, all declarations must have identical type parameter lists, i.e.
   identical type parameter names with identical constraints in identical order;

2. In an interface with multiple declarations, the `extends` clauses are merged into a single set of base types.

**Rules: Property Order After Merging**

* In basic: members declared in the last interface declaration will appear first in the declaration order of the merged
  type.

##### Examples

###### Simple declaration Merging

```ts
interface Box {
    height: number;
    width: number;
}

interface Box {
    scale: number;
}

// Usage
let box: Box = {height: 5, width: 6, scale: 10};
```

```yaml
name: Simple interface declaration merging
entity:
    type: property
    extra: false
    items:
        -   name: Box
            loc: 1:11
            type: interface
            declarations:
                - 6:11
        -   name: height
            qualified: Box.height
            loc: 2:5
        -   name: width
            qualified: Box.width
            loc: 3:5
        -   name: scale
            qualified: Box.scale
            loc: 7:5
```

<!--TODO: Restriction-violated cases-->

#### Semantic: Merging With The Class Type

As mentioned in [here](./class.md#semantic-typescript-class-types), a class declaration creates its own type, it is also
possible to create an interface with the same identifier as the class in advance, in which case declarations will be
merged.

##### Examples

###### Class and interface merging

```ts
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
            declarations:
                - 5:7
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
relation:
    type: use
    items:
        -   from: file:'file0'
            to: property:'Foo.prop0'
            loc: file0:9:23
        -   from: file:'file0'
            to: field:'Foo.prop1'
            loc: file0:10:23
```

### Properties

| Name         | Description                                                          |       Type       |   Default   |
|--------------|----------------------------------------------------------------------|:----------------:|:-----------:|
| declarations | Each item is a code location where a merge-able declaration appears. | `ENRELocation[]` | `undefined` |
