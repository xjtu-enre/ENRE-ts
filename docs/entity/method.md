## Entity: Method

A `Method Entity` is a *function* or function-like thing (
getter / setter) defined inside a `Class Entity`.

### Supported Pattern

```yaml
name: Method declaration
```

#### Syntax: Method Definitions

```text
ClassElement :
    `static` FieldDefinition `;`
    ...

MethodDefinition :
    ClassElementName `(` UniqueFormalParameters `)` `{` FunctionBody `}`
    GeneratorMethod
    AsyncMethod
    AsyncGeneratorMethod
    `get` ClassElementName `(` `)` `{` FunctionBody `}`
    `set` ClassElementName `(` PropertySetParameterList `)` `{` FunctionBody `}`

PropertySetParameterList :
    FormalParameter
```

##### Examples

###### Simple (static) methods

```js
class Foo {
    a() {
        /* Empty */
    }

    #b() {
        /* Empty */
    }

    '✅'() {
        /* Empty */
    }

    1_000_000() {
        /* Empty */
    }

    [`!computed${c}`]() {
        /* Empty */
    }

    static d() {
        /* Empty */
    }

    static #e() {
        /* Empty */
    }
}
```

```yaml
name: Simple class methods
entity:
    type: method
    extra: false
    items:
        -   name: a
            loc: 2:5
        -   name: <Modified raw="b" as="PrivateIdentifier">
            loc: 6:5:2
            private: true
        -   name: <Modified raw="✅" as="StringLiteral">
            loc: 10:5:3
        -   name: <Modified raw="1_000_000" as="NumericLiteral" value="1000000">
            loc: 14:5:9
        -   name: d
            loc: 22:12
            static: true
        -   name: <Modified raw="e" as="PrivateIdentifier">
            loc: 26:12:2
            static: true
            private: true
```

###### Getter / Setter

```js
class Foo {
    get a() {
        /* Empty */
    }

    set a(val) {
        /* Empty */
    }

    static get #b() {
        /* Empty */
    }

    static set #b(val) {
        /* Empty */
    }
}
```

```yaml
name: Getter setter as class method
entity:
    type: method
    extra: false
    items:
        -   name: a
            loc: 2:9
            kind: get
        -   name: a
            loc: 6:9
            kind: set
        -   name: <Modified raw="b" as="PrivateIdentifier">
            loc: 10:16:2
            static: true
            private: true
            kind: get
        -   name: <Modified raw="b" as="PrivateIdentifier">
            loc: 14:16:2
            static: true
            private: true
            kind: set
```

#### Syntax: Generator Method

```text
GeneratorMethod :
    `*` ClassElementName `(` UniqueFormalParameters `)` `{` GeneratorBody `}`
```

##### Examples

###### Generator method

```js
class Foo {
    * bar() {
        /* Empty */
    }

    static* #baz() {
        /* Empty */
    }
}
```

```yaml
name: Generator method
entity:
    type: method
    extra: false
    items:
        -   name: bar
            loc: 2:7
            generator: true
        -   name: <Modified raw="baz" as="PrivateIdentifier">
            loc: 6:13:4
            static: true
            private: true
            generator: true
```

#### Syntax: Async Method

```text
AsyncMethod :
    `async` ClassElementName `(` UniqueFormalParameters `)` `{` AsyncFunctionBody `}`
```

##### Examples

###### Async method

```js
class Foo {
    async bar() {
        /* Empty */
    }

    static async #baz() {
        /* Empty */
    }
}
```

```yaml
name: Async method
entity:
    type: method
    extra: false
    items:
        -   name: bar
            loc: 2:11
            async: true
        -   name: <Modified raw="baz" as="PrivateIdentifier">
            loc: 6:18:4
            static: true
            private: true
            async: true
```

#### Syntax: Async Generator Method

```text
AsyncGeneratorMethod :
    `async *` ClassElementName `(` UniqueFormalParameters `)` `{` AsyncGeneratorBody `}`
```

##### Examples

###### Async generator method

```js
class Foo {
    async* bar() {
        /* Empty */
    }

    static async* #baz() {
        /* Empty */
    }
}
```

```yaml
name: Async generator method
entity:
    type: method
    extra: false
    items:
        -   name: bar
            loc: 2:12
            async: true
            generator: true
        -   name: <Modified raw="baz" as="PrivateIdentifier">
            loc: 6:19:4
            static: true
            private: true
            async: true
            generator: true
```
