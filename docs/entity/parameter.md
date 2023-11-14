## Entity: Parameter

A `Parameter Entity` is a variable defined either as formal parameter of function /
method / setter or in a `catch` clause.

### Supported Patterns

```yaml
name: Parameter declaration
```

#### Syntax: Function Parameter Lists

```text
FormalParameters :
    /* Empty */
    FunctionRestParameter
    FormalParameterList
    FormalParameterList `,`
    FormalParameterList `,` FunctionRestParameter

FormalParameterList :
    FormalParameter
    FormalParameterList `,` FormalParameter

FunctionRestParameter :
    BindingRestElement

FormalParameter :
    BindingElement
```

##### Examples

###### Typical function parameters

```js
// Simple
function foo(a, b = 0, ...r) {
    /* Empty */
}

// Fancy
function bar({a, b: [c, {d}, ...e], f: {}, ...g}, h = 0, ...r) {
    /* Empty */
}
```

```yaml
name: Function parameters
entity:
    type: parameter
    extra: false
    items:
        -   name: a
            loc: 2:14
        -   name: b
            loc: 2:17
        -   name: r
            loc: 2:27
        -   name: a
            loc: 7:15
        -   name: c
            loc: 7:22
        -   name: d
            loc: 7:26
        -   name: e
            loc: 7:33
        -   name: g
            loc: 7:47
        -   name: h
            loc: 7:51
        -   name: r
            loc: 7:61
```

#### Syntax: Arrow Function Parameter Lists

```text
ArrowParameters :
    BindingIdentifier
    CoverParenthesizedExpressionAndArrowParameterList

CoverParenthesizedExpressionAndArrowParameterList :
    `(` Expression `)`
    `(` Expression `,` `)`
    `(` `)`
    `(` `...` BindingIdentifier `)`
    `(` `...` BindingPattern `)`
    `(` Expression `,` `...` BindingIdentifier `)`
    `(` Expression `,` `...` BindingPattern `)`

UniqueFormalParameters :
    FormalParameters
```

##### Examples

###### Single parameter in arrow function

```js
a => {
    /* Empty */
}
```

```yaml
name: Single parameter in arrow function
entity:
    type: parameter
    extra: false
    items:
        -   name: a
            loc: 1:1
```

#### Syntax: Class Methods

```text
See docs/entity/method.md
```

##### Examples

###### Parameter in class method

```js
class Foo {
    bar(a) {
        /* Empty */
    }
}
```

```yaml
name: Single parameter in class method
entity:
    type: parameter
    extra: false
    items:
        -   name: a
            loc: 2:9
```

#### Syntax: Setter

```text
see docs/entity/method.md#getter-setter
    docs/entity/property.md#getter-setter
```

##### Examples

###### Parameter in setter

```js
class Foo {
    set a(val) {
        /* Empty */
    }
}
```

```yaml
name: Single parameter in setter
entity:
    type: parameter
    extra: false
    items:
        -   name: val
            loc: 2:11
```

#### Syntax: The `try` Statement

```text
TryStatement :
    `try` Block Catch
    `try` Block Finally
    `try` Block Catch Finally

Catch :
    `catch` ( CatchParameter ) Block
    `catch` Block

Finally :
    `finally` Block

CatchParameter :
    BindingIdentifier
    BindingPattern
```

##### Examples

###### Catch clause with simple parameter

```js
try {
    /* Empty */
} catch (e) {
    /* Empty */
}
```

```yaml
name: Catch clause with parameter
entity:
    type: parameter
    extra: false
    items:
        -   name: e
            loc: 3:10
```

###### Catch clause with no parameter

```js
try {
    /* Empty */
} catch {
    /* Empty */
}
```

```yaml
name: Catch clause with no parameter
entity:
    type: parameter
    extra: false
    items: [ ]
```

###### Identifier can be destructured

```js
try {
    /* Empty */
} catch ({a, b: [c, {d}, ...e], f: {}, ...g}) {
    /* Empty */
}
```

```yaml
name: Destructuring catch parameter
entity:
    type: parameter
    extra: false
    items:
        -   name: a
            loc: 3:11
        -   name: c
            loc: 3:18
        -   name: d
            loc: 3:22
        -   name: e
            loc: 3:29
        -   name: g
            loc: 3:43
```

#### Syntax: TypeScript Optional Parameter

```text
ParameterList :
    RequiredParameterList
    OptionalParameterList
    RestParameter
    RequiredParameterList `,` OptionalParameterList
    RequiredParameterList `,` RestParameter
    OptionalParameterList `,` RestParameter
    RequiredParameterList `,` OptionalParameterList `,` RestParameter

RequiredParameterList :
    RequiredParameter
    RequiredParameterList `,` RequiredParameter

RequiredParameter :
    [AccessibilityModifier] BindingIdentifierOrPattern [TypeAnnotation]
    BindingIdentifier `:` StringLiteral

AccessibilityModifier :
    `public`
    `private`
    `protected`

BindingIdentifierOrPattern :
    BindingIdentifier
    BindingPattern

OptionalParameterList :
    OptionalParameter
    OptionalParameterList `,` OptionalParameter

OptionalParameter :
    [AccessibilityModifier] BindingIdentifierOrPattern `?` [TypeAnnotation]
    [AccessibilityModifier] BindingIdentifierOrPattern [TypeAnnotation] Initializer
    BindingIdentifier `?` `:` StringLiteral

RestParameter :
    `...` BindingIdentifier TypeAnnotation
```

`AccessibilityModifier` is only available in class constructor's parameter list and the
next token is NOT a `BindingPattern`.

##### Examples

###### Optional parameters

```ts
function foo(
    param0?: number,
    {param1} = {param1: 'content'},
    param2?: 'default param2',
) {
    /* Empty */
}

// Usage
foo();
foo(0);
foo(0, {param1: 'another content'});
/**
 * Parameter with type as `StringLiteral` can be assigned
 * only with that string literal.
 */
foo(0, {param1: 'another content'}, 'default param2');

// Invalid
// foo(0, {param1: 'another content'}, 'another param2');
// TSError: Argument of type '"another param2"' is not assignable to parameter of type '"default param2"'.
```

```yaml
name: TS optional parameters
entity:
    type: parameter
    extra: false
    items:
        -   name: param0
            qualified: foo.param0
            loc: 2:5
            optional: true
        -   name: param1
            qualified: foo.param1
            loc: 3:6
            optional: true
        -   name: param2
            qualified: foo.param2
            loc: 4:5
            optional: true
```

#### Semantic: `this` in Parameter List

JavaScript does not allow a parameter to have the name of `this`, however, TypeScript
allows this for typing `this`, in which case it serves as a pseudo-parameter.

##### Examples

###### `this` in JavaScript

[//]: # (@formatter:off)
```js
function foo(this) {
    /* Empty */
}
```
[//]: # (@formatter:on)

```yaml
name: this in JavaScript
entity:
    type: parameter
    extra: false
    items:
        -   name: this
            loc: 1:14
            negative: true
```

###### `this` in TypeScript

```ts
function foo(this: object) {
    this.a = 1
}

// Usage
const obj = new foo();
console.log(obj.a);
```

```yaml
name: this in TypeScript
entity:
    type: parameter
    extra: false
    items:
        -   name: this
            loc: 1:14
            negative: true
```

### Properties

| Name | Description | Type | Default |
|------|-------------|:----:|:-------:|
