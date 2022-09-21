## Entity: Method

A `Method Entity` is a *function* or function-like thing (
getter / setter) defined inside a `Class Entity` or an object
literal.

### Supported Patterns

```yaml
name: Method declaration
```

#### Syntax: Method Definitions

```text
ClassElement :
    MethodDefinition
    `static` MethodDefinition
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
            qualified: Foo.a
            loc: 2:5
        -   name: <Modified raw="b" as="PrivateIdentifier">
            qualified: Foo.#b
            loc: 6:5:2
            private: true
        -   name: <Modified raw="✅" as="StringLiteral">
            qualified: Foo.'✅'
            loc: 10:5:3
        -   name: <Modified raw="1_000_000" as="NumericLiteral" value="1000000">
            qualified: Foo.'1000000'
            loc: 14:5:9
        -   name: d
            qualified: Foo.d
            loc: 22:12
            static: true
        -   name: <Modified raw="e" as="PrivateIdentifier">
            qualified: Foo.#e
            loc: 26:12:2
            static: true
            private: true
```

###### Constructor

Method named with `constructor` serves as a special method that
will be called when the class is referenced with `new`.

If no `constructor` is declared, a default constructor will be
emitted.

In TypeScript, class fields can be declared as constructor's
parameters,
see [correlated section](./field.md#implicit-field-declarations-with-accessibility-modifier)
to learn more.

```js
class Foo {
    constructor() {
        this.a = 0;
    }
}
```

```yaml
name: Class constructor
entity:
    type: method
    extra: false
    items:
        -   name: constructor
            qualified: Foo.constructor
            loc: 2:5
            kind: constructor
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
            qualified: Foo.a
            loc: 2:9
            kind: get
        -   name: a
            qualified: Foo.a
            loc: 6:9
            kind: set
        -   name: <Modified raw="b" as="PrivateIdentifier">
            qualified: Foo.#b
            loc: 10:16:2
            static: true
            private: true
            kind: get
        -   name: <Modified raw="b" as="PrivateIdentifier">
            qualified: Foo.#b
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
            qualified: Foo.bar
            loc: 2:7
            generator: true
        -   name: <Modified raw="baz" as="PrivateIdentifier">
            qualified: Foo.#baz
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
            qualified: Foo.bar
            loc: 2:11
            async: true
        -   name: <Modified raw="baz" as="PrivateIdentifier">
            qualified: Foo.#baz
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
            qualified: Foo.bar
            loc: 2:12
            async: true
            generator: true
        -   name: <Modified raw="baz" as="PrivateIdentifier">
            qualified: Foo.#baz
            loc: 6:19:4
            static: true
            private: true
            async: true
            generator: true
```

#### Syntax: Object Literal Method Declarations

```text
ObjectLiteral :
    `{` `}`
    `{` PropertyDefinitionList `}`
    `{` PropertyDefinitionList `,` `}`

PropertyDefinitionList :
    PropertyDefinition
    PropertyDefinitionList `,` PropertyDefinition

PropertyDefinition :
    MethodDefinition
    ...
```

##### Examples

###### Object literal method declarations

```js
const b = {
    c() {
        /* Empty */
    },
    * d() {
        yield 1;
    },
    async e() {
        /* Empty */
    },
    async* f() {
        /* Empty */
    },
    get g() {
        return 1;
    },
    set g(val) {
        /* Empty */
    },
}
```

```yaml
name: Object literal method declarations
entity:
    type: method
    extra: false
    items:
        -   name: c
            qualified: b.c
            loc: 2:5
        -   name: d
            qualified: b.d
            loc: 5:7
            generator: true
        -   name: e
            qualified: b.e
            loc: 8:11
            async: true
        -   name: f
            qualified: b.f
            loc: 11:12
            async: true
            generator: true
        -   name: g
            qualified: b.g
            loc: 14:9
            kind: get
        -   name: g
            qualified: b.g
            loc: 17:9
            kind: set
```

#### Syntax: TypeScript Method Accessibility Modifiers

```text
ClassElement :
    [AccessibilityModifier] MethodDefinition
    [AccessibilityModifier] `static` MethodDefinition
    
AccessibilityModifier :
    `public`
    `protected`
    `private`
```

##### Examples

###### The `public` modifier

```ts
class Foo {
    public a() {
        /* Empty */
    }

    b() {
        /* Empty */
    }
}
```

```yaml
name: TS method public modifier
entity:
    type: method
    extra: false
    items:
        -   name: a
            qualified: Foo.a
            loc: 2:12
            TSModifier: public
        -   name: b
            qualified: Foo.b
            loc: 6:5
            TSModifier: public
```

###### The `protected` modifier

```ts
class Foo {
    protected a() {
        /* Empty */
    }
}
```

```yaml
name: TS method protected modifier
entity:
    type: method
    extra: false
    items:
        -   name: a
            qualified: Foo.a
            loc: 2:15
            TSModifier: protected
```

###### The `private` modifier

```ts
class Foo {
    private a() {
        /* Empty */
    }
}
```

```yaml
name: TS method private modifier
entity:
    type: method
    extra: false
    items:
        -   name: a
            qualified: Foo.a
            loc: 2:13
            TSModifier: private
```

###### Cannot be used with the private identifier

```ts
//// @no-test
class Foo {
    protected #a() {
        /* Empty */
    }
}
```

#### Syntax: TypeScript Abstract Method

```text
MemberFunctionDeclaration :
    MemberFunctionOverload MemberFunctionImplementation
    AbstractMemberFunctionOverloads

AbstractMemberFunctionOverloads :
    AbstractMemberFunctionOverload
    AbstractMemberFunctionOverloads AbstractMemberFunctionOverload

AbstractMemberFunctionOverload :
    [AccessibilityModifier] `abstract` PropertyName CallSignature `;`
```

While transcribing, the `abstract` before the class identifier
will be removed, and methods modified by `abstract` will simply
be removed and thus have no representation.

##### Examples

###### Abstract methods

```ts
abstract class Foo {
    abstract propLike: () => void;

    abstract foo(): void;

    // TS Modifiers, must precede the `abstract` keyword
    public abstract bar(p: number): string;

    protected abstract baz(): void;

    // TSError: 'private' modifier cannot be used with 'abstract' modifier.
    private abstract syntaxError(): void;
}
```

```yaml
name: Abstract method declarations
entity:
    type: method
    extra: false
    items:
        -   name: propLike
            qualified: Foo.propLike
            loc: 2:14
            abstract: true
        -   name: foo
            qualified: Foo.foo
            loc: 4:14
            abstract: true
            TSModifier: public
        -   name: bar
            qualified: Foo.bar
            loc: 7:21
            abstract: true
            TSModifier: public
        -   name: baz
            qualified: Foo.baz
            loc: 9:24
            abstract: true
            TSModifier: protected
        -   name: syntaxError
            qualified: Foo.syntaxError
            loc: 12:22
            abstract: true
            TSModifier: private
            negative: true
```

###### `abstract` methods must be declared within an abstract class

```ts
class Foo {
    // TSError: Abstract methods can only appear within an abstract class.
    abstract foo(): void;
}
```

```yaml
name: Abstract methods in a non-abstract class
entity:
    extra: false
    items:
        -   name: Foo
            type: class
            loc: 1:7
            abstract: false
        -   name: foo
            qualified: Foo.foo
            type: method
            loc: 3:14
            abstract: true
            negative: true
```

###### Private methods cannot be abstract

```ts
abstract class Foo {
    // TSError: 'abstract' modifier cannot be used with a private identifier.
    abstract #foo(): void;
}
```

```yaml
name: Private methods cannot be abstract
entity:
    type: method
    extra: false
    items:
        -   name: <Modified raw="foo" as="PrivateIdentifier">
            qualified: Foo.#foo
            loc: 3:14
            abstract: true
            negative: true
```

###### Static methods cannot be abstract

```ts
abstract class Foo {
    // TSError: 'static' modifier cannot be used with 'abstract' modifier.
    abstract static foo(): void;

    // TSError: 'static' modifier cannot be used with 'abstract' modifier.
    static abstract bar(): void;
}
```

```yaml
name: Static methods cannot be abstract
entity:
    type: method
    extra: false
    items:
        -   name: foo
            qualified: Foo.foo
            loc: 3:21
            static: true
            abstract: true
            negative: true
        -   name: bar
            qualified: Foo.bar
            loc: 6:21
            static: true
            abstract: true
            negative: true
```

###### Constructor method cannot be abstract

```ts
abstract class Foo {
    abstract constructor() {
        // TSError: Constructor cannot be 'abstract'.
    }
}
```

```yaml
name: Constructor method cannot be abstract
entity:
    type: method
    extra: false
    items:
        -   name: constructor
            qualified: Foo.constructor
            loc: 2:14
            kind: constructor
            abstract: true
            negative: true
```

###### Use type functions rather than syntax sugar to express async and/or generator methods

ECMAScript uses `async` and `*` to denote a method is an
async method and/or generator method.

However, in TypeScript, those symbols are not allowed to be used
with `abstract`. Instead, corresponding type
functions:

* `Promise<T>` (for async method),
* `IterableIterator<T>` (for generator method),
* `AsyncIterableIterator<T>` (for async generator method),

should be used to express the return type of methods.

[//]: # (@formatter:off)
> Continue
> reading [this issue](https://github.com/microsoft/TypeScript/issues/25710)
> to learn more about the design decision.

[//]: # (@formatter:on)

```ts
abstract class Foo {
    abstract asyncMethod(): Promise<void>;

    abstract generatorMethod(): IterableIterator<void>;

    abstract asyncGeneratorMethod(): AsyncIterableIterator<void>;

    // Invalid
    // TSError: 'async' modifier cannot be used with 'abstract' modifier.
    abstract async invalidAsyncMethod(): void;

    // TSError: An overload signature cannot be declared as a generator.
    abstract* invalidGeneratorMethod(): void;

    // TSError: 'async' modifier cannot be used with 'abstract' modifier.
    abstract async* invalidAsyncGeneratorMethod(): void;
}
```

```yaml
name: Type annotations for abstract async generator method
entity:
    type: method
    extra: false
    items:
        -   name: asyncMethod
            qualified: Foo.asyncMethod
            loc: 2:14
            async: true
            abstract: true
        -   name: generatorMethod
            qualified: Foo.generatorMethod
            loc: 4:14
            generator: true
            abstract: true
        -   name: asyncGeneratorMethod
            qualified: Foo.asyncGeneratorMethod
            loc: 6:14
            async: true
            generator: true
            abstract: true
        -   name: invalidAsyncMethod
            qualified: Foo.invalidAsyncMethod
            loc: 10:20
            async: true
            abstract: true
            negative: true
        -   name: invalidGeneratorMethod
            qualified: Foo.invalidGeneratorMethod
            loc: 13:15
            generator: true
            abstract: true
            negative: true
        -   name: invalidAsyncGeneratorMethod
            qualified: Foo.invalidAsyncGeneratorMethod
            loc: 16:21
            async: true
            generator: true
            abstract: true
            negative: true
```

### Properties

| Name | Description | Type | Default |
|---|---|:---:|:---:|
| kind | The kind of the method. | `'constructor'` \| `'method'` \| `'get'` \| `'set'` | `'method'` |
| isStatic | Indicates a static method. | `boolean` | `false` |
| isPrivate | Indicates a private method. | `boolean` | `false` |
| isImplicit | Indicates a method is created implicitly. | `boolean` | `false` |
| isAsync | Indicates an async method. | `boolean` | `false` |
| isGenerator | Indicates a generator method. | `boolean` | `false` |
| isAbstract | Indicates an abstract method in an abstract class. | `boolean` | `false` |
| TSModifier | TypeScript accessibility modifier. | `'public'` \| `'protected'` \| `'private'` | `'public'` |
