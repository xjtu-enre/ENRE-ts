## Entity: Class

A `Class Entity` is a template of object containing properties and methods defined by
the keyword `class`.

### Supported Patterns

```yaml
name: Class declaration
```

#### Syntax: Class Definitions

```text
ClassDeclaration :
    `class` BindingIdentifier ClassTail
    `class` ClassTail /* Default */

ClassExpression :
    `class` [BindingIdentifier] ClassTail

ClassTail :
    [ClassHeritage] `{` [ClassBody] `}`
```

##### Examples

###### Simple class declaration

```js
class Foo {
    /* Empty */
}
```

```yaml
name: Simple class declaration
entity:
    type: class
    extra: false
    items:
        -   name: Foo
            loc: 1:7
```

###### Default export anonymous class

```js
export default class {
    /* Empty */
}
```

```yaml
name: Default export anonymous class
entity:
    type: class
    extra: false
    items:
        -   name: <Anon Class>
            loc: 1:16:0
```

###### Default export named class

```js
export default class Foo {
    /* Empty */
}
```

```yaml
name: Default export named class
entity:
    type: class
    extra: false
    items:
        -   name: Foo
            loc: 1:22
```

###### Class expression

```js
const foo = class {
    /* Empty */
}

const bar = class Baz {
    /* Empty */
}
```

```yaml
name: Class expression
entity:
    type: class
    extra: false
    items:
        -   name: foo
            loc: 1:13
        -   name: Baz
            loc: 5:19
```

#### Syntax: TypeScript Abstract Class Definitions

```text
ClassDeclaration :
    `abstract class` BindingIdentifier ClassTail
    `abstract class` ClassTail /* Default */
    /* Class expressions cannot be abstract */
```

> Isolated specification available
> in [this issue](https://github.com/Microsoft/TypeScript/issues/3578).

The abstract class serves as base class whose fields, methods may be defined but with no
implementations (abstract field / method).

The abstract class cannot be instantiated with `new`, only its derived classes which
implement all the abstract members can be instantiated.

##### Examples

###### Abstract class declaration

```ts
abstract class Foo {
    abstract getSomething(): string
}
```

```yaml
name: Abstract class declaration
entity:
    type: class
    extra: false
    items:
        -   name: Foo
            loc: 1:16
            abstract: true
```

#### Supplemental: Class Element Name

`ClassElementName` is used by both fields and methods (class elements). This defines that
class elements' name can not only be an identifier, but also a string, number or even
computed name (in which case, the element name can only be determined in runtime.)

```text
ClassElementName :
    PropertyName
    PrivateIdentifier

PropertyName :
    LiteralPropertyName
    ComputedPropertyName

LiteralPropertyName :
    IdentifierName
    StringLiteral
    NumericLiteral

ComputedPropertyName :
    `[` AssignmentExpression `]`
    
PrivateIdentifier :
    `#` IdentifierName
```

#### Supplemental: Class Bodies

```text
ClassBody :
    ClassElementList

ClassElementList :
    ClassElement
    ClassElementList ClassElement

ClassElement :
    MethodDefinition
    `static` MethodDefinition
    FieldDefinition `;`
    `static` FieldDefinition `;`
    ClassStaticBlock
    `;`
    
ClassStaticBlock :
    `static` `{` ClassStaticBlockBody `}`

ClassStaticBlockBody :
    ClassStaticBlockStatementList

ClassStaticBlockStatementList :
    [StatementList]
```

#### Semantic: TypeScript Class Types

In TypeScript, a class declaration creates two things,

* A type representing instances of the class;
* A constructor function (function that be called with `new`).

The type can be used as an interface type, which would be useful to simplify definitions
for the same class/interface.

##### Examples

###### Class type

```ts
//// @no-test
class Point {
    constructor(public x: number, public y: number) {
        /* Empty */
    }

    get distance() {
        return (this.x ** 2 + this.y ** 2) ** 0.5;
    }
}

// Usage, note that class `Point` is referenced as type.
const instance: Point = new Point(1, 1);
```

#### Semantic: Constructor Function Definition

A function which uses `this.* = *` pattern inside can also be instantiated with `new`, at
when `this` will be an empty object, and any assignment will be appended to this newly
created object.

This technic is only recommend if the project is not using TypeScript, in which case
TypeScript complains that `this` is possibly `undefiend`.

> Continue
> reading [this MDN doc](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new#description)
> to learn more.

##### Examples

###### TODO

```js
//// @no-test
```

### Properties

| Name       | Description                                             |   type    | Default |
|------------|---------------------------------------------------------|:---------:|:-------:|
| isAbstract | Available in TypeScript, indicates a class is abstract. | `boolean` | `false` |
