## Relation: Extend

An `Extend Relation` establishes a link between `Class Entity`s
and `Interface Entity`s that enables hierarchical reusing.

### Supported Patterns

```yaml
name: Extend declaration
```

#### Syntax: Class Extends Class

```text
ClassHeritage :
    `extends` LeftHandSideExpression

LeftHandSideExpression :
    NewExpression
    CallExpression
    OptionalExpression
```

ECMAScript does not support multiple inheritance.

##### Examples

###### Class can only extend one class

```js
class Foo {
    prop0;
}

class Bar extends Foo {
    prop1;
}
```

```yaml
name: Class extends class
relation:
    type: extend
    extra: false
    items:
        -   from: class:'Bar'
            to: class:'Foo'
            loc: file0:5:19
```

#### Syntax: TypeScript Interface Extends Interface or Class

```text
InterfaceExtendsClause :
    `extends` ClassOrInterfaceTypeList

ClassOrInterfaceTypeList :
    ClassOrInterfaceType
    ClassOrInterfaceTypeList `,` ClassOrInterfaceType

ClassOrInterfaceType :
    TypeReference
```

##### Examples

###### Interface extends interface

```ts
interface Foo {
    prop0: number,
}

interface Bar extends Foo {
    prop1: number,
}
```

```yaml
name: Interface extends interface
relation:
    type: extend
    extra: false
    items:
        -   from: interface:'Bar'
            to: interface:'Foo'
            loc: file0:5:23
```

###### Interface extends class

```ts
class Foo {
    prop0: number;
}

interface Bar extends Foo {
    prop1: number,
}
```

```yaml
name: Interface extends class
relation:
    type: extend
    extra: false
    items:
        -   from: interface:'Bar'
            to: class:'Foo'
            loc: file0:5:23
```

#### Syntax: TypeScript Type Parameter Constraints

```text
TypeParameter :
    BindingIdentifier [Constraint]

Constraint :
    `extends` Type
```

[//]: # (@formatter:off)
> See
> [docs/entity/type-parameter.md](../entity/type-parameter.md#supplemental-production-rules)
> for a full list of all production rules, and
> the [type parameter constraints](../entity/type-parameter.md#semantic-type-parameter-constraints)
> section for comprehensive rules of constraints.

[//]: # (@formatter:on)

##### Examples

###### Type parameter extends type

```ts
type bar = number | undefined;

interface Foo<T extends Bar> {
    prop0: T
}
```

```yaml
name: Type parameter extends type
relation:
    type: extend
    extra: false
    items:
        -   from: type parameter:'T'
            to: type alias:'bar'
            loc: file0:3:17
```

###### Type parameter extends type parameter

```ts
interface Foo<T extends U, U> {
    prop0: T,
    prop1: U,
}
```

```yaml
name: Type parameter extends type parameter
relation:
    type: extend
    extra: false
    items:
        -   from: type parameter:'T'
            to: type parameter:'U'
            loc: file0:1:25
```
