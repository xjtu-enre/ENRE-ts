## Relation: Extend

An `Extend Relation` establishes a link between `Class Entity`s and `Interface Entity`s that enables hierarchical reusing, or setups a restriction on `Type Parameter Entity`.

Underlying JavaScript utilizes prototype-chain to emulate class `extend`ing, where fields and methods, when referenced, are searched bottom-up from the object to its prototype and prototype's prototype.

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

###### Class extends from expression

As production rules depict, what after `extends` can not only be an identifier of a class, but also any expressions, e.g. function calls, condition expressions, that finally return a class.

```js
function f(phrase) {
    return class {
        sayHi() {
            alert(phrase);
        }
    };
}

class User extends f("Hello") {
}

new User().sayHi(); // Hello
```

```yaml
name: Class extends from expression
entity:
    items:
        -   name: f
            loc: 1:10
            type: function
        -   name: <Anonymous as="Class">
            loc: 2:12
            type: class
        -   name: User
            loc: 9:7
            type: class
relation:
    type: extend
    extra: false
    items:
        -   from: class:'User'
            to: class:'<Anonymous as="Class">'[@loc=2]
            loc: file0:9:20
```

#### Syntax: TypeScript Interface Extends Types

```text
InterfaceExtendsClause :
    `extends` ClassOrInterfaceTypeList

ClassOrInterfaceTypeList :
    ClassOrInterfaceType
    ClassOrInterfaceTypeList `,` ClassOrInterfaceType

ClassOrInterfaceType :
    TypeReference
```

The duplicated properties across base-interfaces and the sub-interface must conform to the specific rule, which is:

* Inherited properties with the same name must be identical (or are subtypes for functions);

##### Examples

###### Interface extends interfaces

```ts
interface Foo {
    prop0: number,
}

interface Bar {
    prop1: string,
}

interface Baz extends Foo, Bar {
    /**
     * If the same name appears at the subinterface,
     * they must be identical.
     */
    prop1: string,
    prop2: Object,
}
```

```yaml
name: Interface extends interfaces
relation:
    type: extend
    extra: false
    items:
        -   from: interface:'Baz'
            to: interface:'Foo'
            loc: file0:9:23
        -   from: interface:'Baz'
            to: interface:'Bar'
            loc: file0:9:28
```

###### Interface extends merging

In an interface with multiple declarations, the `extends` clauses are merged into a single set of base types.

```ts
interface Foo {
    prop0: string,
}

interface Bar {
    prop1: string,
}

interface Baz extends Foo {
    prop2: string,
}

interface Baz extends Bar {
    prop3: string,
}
```

```yaml
name: Interface extends merging
relation:
    type: extend
    extra: false
    items:
        -   from: interface:'Baz'
            to: interface:'Foo'
            loc: file0:9:23
        -   from: interface:'Baz'
            to: interface:'Bar'
            loc: file0:13:23
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

> See [docs/entity/type-parameter.md](../entity/type-parameter.md#supplemental-production-rules) for a full list of all production rules, and the [type parameter constraints](../entity/type-parameter.md#semantic-type-parameter-constraints) section for comprehensive rules of constraints.

##### Examples

###### Type parameter extends type

```ts
type bar = number | undefined;

interface Foo<T extends bar> {
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
            loc: file0:3:25
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

### Properties

| Name | Description | Type | Default |
|------|-------------|:----:|:-------:|
