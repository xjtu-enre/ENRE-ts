## Entity: Type Parameter

A `Type Parameter Entity` is a placeholder for an actual type,
and entities involving type parameters are usually called
'generics'.

### Supported Patterns

```yaml
name: Type parameter declaration
```

#### Supplemental: Production Rules

The production rule of `TypeParameters` is used in many place
hereinafter, so it is listed in advance.

```text
TypeParameters :
    `<` TypeParameterList `>`

TypeParameterList :
    TypeParameter
    TypeParameterList `,` TypeParameter

TypeParameter :
    BindingIdentifier [Constraint] [Default]
```

> [This proposal](https://github.com/Microsoft/TypeScript/issues/2175)
> added the functionality of default type parameter, which was
> not listed in the outdated spec, production rules in the upper
> text block are our guessing.

#### Syntax: Class Type Parameter

```text
ClassDeclaration:
    `class` [BindingIdentifier] [TypeParameters] ClassHeritage `{` ClassBody `}`
```

##### Examples

###### Single class type parameter

```ts
class Foo<T> {
    variable0: T;                   // Referenced by class field

    CalcuVaraible(input: T): T {    // Referenced by class method
        /* Empty */
    }
}
```

```yaml
name: Single class type parameter
entity:
    type: type parameter
    extra: false
    items:
        -   name: T
            qualified: Foo.T
            loc: 1:11
```

###### Cannot be referenced in static member declarations

Since static members will only be evaluated once during the whole
life circle of a class, giving them variable types seems to be
not useful.

```ts
//// @no-test
class Foo<T> {
    static violation: T;
    // TSError: Static members cannot reference class type parameters.
}
```

#### Syntax: Interface Type Parameter

```text
InterfaceDeclaration :
    `interface` BindingIdentifier [TypeParameters] [InterfaceExtendsClause] ObjectType
```

##### Examples

###### Single interface type parameter

The identifier used by a type parameter can still show up as an
interface property, although the qualified name are same (Foo.T),
they can still be distinguished by type.

```ts
interface Foo<T> {
    bar: T,         // The type parameter is used as type annotation
    T: string,      // `T` is a property, and just with the same identifier as the type parameter
}
```

```yaml
name: Single interface type parameter
entity:
    type: type parameter
    items:
        -   name: T
            qualified: Foo.T
            loc: 1:15
```

###### Multiple interface type parameters

```ts
interface Foo<T, U, V> {
    alpha: T,
    beta: U,
    gamma: V,
}
```

```yaml
name: Multiple interface type parameters
entity:
    type: type parameter
    extra: false
    items:
        -   name: T
            qualified: Foo.T
            loc: 1:15
        -   name: U
            qualified: Foo.U
            loc: 1:18
        -   name: V
            qualified: Foo.V
            loc: 1:21
```

#### Syntax: Type Alias Type Parameter

```text
TypeAliasDeclaration :
    `type` BindingIdentifier [TypeParameters] `=` Type `;`
```

##### Examples

###### Simple type alias type parameter

```ts
interface Foo<T> {
    prop0: T
}

type bar<T> = Foo<T> | undefined;
```

```yaml
name: Generic type alias
entity:
    type: type parameter
    items:
        -   name: T
            qualified: bar.T
            loc: 5:10
```

#### Syntax: Function Type Parameter

```text
CallSignature :
    [TypeParameters] `(` [ParameterList] ) [TypeAnnotation]

FunctionType :
    [TypeParameters] `(` [ParameterList] `)` `=>` Type
```

##### Examples

###### Function declaration type parameter

```ts
async function* foo<T>(param0: T) {
    /* Empty */
}

const bar = <T>(param0: T) => {
    /* Empty */
}
```

```yaml
name: Function declaration type parameter
entity:
    type: type parameter
    extra: false
    items:
        -   name: T
            qualified: foo.T
            loc: 1:21
        -   name: T
            qualified: bar.T
            loc: 5:14
```

###### Accessors cannot have type parameters

```ts
class Foo {
    get foo<T>() {
        // TSError: An accessor cannot have type parameters.
        return 0;
    }

    set foo<T>(val: T) {
        // TSError: An accessor cannot have type parameters.
        this.foo = val;
    }
}
```

```yaml
name: Accessors cannot have type parameters
entity:
    type: type parameter
    extra: false
    items:
        -   name: T
            qualified: Foo.foo.T
            loc: 2:13
            negative: true
        -   name: T
            qualified: Foo.foo.T
            loc: 6:13
            negative: true
```

#### Syntax: Type Parameter Constraints

```text
Constraint :
    `extends` Type
```

Type parameters can be constrained by using the `extends`
keyword, which gives upper bounds that the type parameters must
conform to.

##### Examples

> Examples below take `interface` as base entities.

###### Implicit constraint

> **Questionable:** All type parameters implicitly have an upper
> bound `{}` (empty object type).

```ts
//// @no-test
interface Foo<T> {
    prop0: T,
}

type StoreNumber = Foo<number>;
type StoreString = Foo<string>;

type StoreUndefined = Foo<undefined>;
type StoreNull = Foo<null>;

interface Bar<T extends {}> {
    prop0: T,
}

type Invalid0 = Foo<undefined>;
type Invalid1 = Foo<null>;
// TSError: Type xxx does not satisfy the constraint '{}'.
```

###### Explicit constraint

```ts
interface Foo<T extends string> {
    prop0: T
}

type UseStringLiteral = Foo<'Bar'>;
```

```yaml
name: Type parameter explicit constrain
entity:
    type: type parameter
    extra: false
    items:
        -   name: T
            qualified: Foo.T
            loc: 1:15
            constraint:
```

###### Param-list self-referenced explicit constraint

```ts
// U and V have an upper bound of `Function`
interface Foo<T, U extends V, V extends Function> {
    /* Empty */
}
```

```yaml
name: Param-list self-reference constrain
entity:
    type: type parameter
    extra: false
    items:
        -   name: T
            qualified: Foo.T
            loc: 2:15
        -   name: U
            qualified: Foo.U
            loc: 2:18
            constraint: V
        -   name: V
            qualified: Foo.V
            loc: 2:31
            constraint: Function
```

###### No cyclic self-references

Directly or indirectly cyclic self-references are not allowed.

```ts
//// @no-test
// Direct self-reference
interface A<T extends T> {
    /* Empty */
}

// Indirect self-reference
interface B<T extends U, U extends T> {
    /* Empty */
}
```

#### Syntax: Type Parameter Defaults

```text
Default :
    `=` Type
```

Type parameters can be given a default type respectively, when a
default is presents, the corresponding place could be omitted in
usages. When a constraint and a default are both present for the
same type parameter, the default type should also conform to the
constraint.

##### Examples

###### Simple type parameter default

```ts
interface Foo<T = number> {
    prop0: T;
}

// Default usage
let instance0: Foo;

// Overrides default
let instance1: Foo<string>;
```

```yaml
name: Simple type parameter default
entity:
    type: type parameter
    extra: false
    items:
        -   name: T
            loc: 1:15
            default: number
```

###### Type parameter default with valid constraint

```ts
interface Foo<T extends number = number> {
    prop0: T;
}
```

```yaml
name: Type parameter default with valid constraint
entity:
    type: type parameter
    extra: false
    items:
        -   name: T
            loc: 1:15
            constraint: number
            default: number
```

###### Type parameter constraint with invalid default

```ts
//// @no-test
interface Foo<T extends number = string> {
    // TSError: Type 'string' does not satisfy the constraint 'number'.
    prop0: T;
}
```

###### No cyclic self-reference

```ts
//// @no-test
interface Foo<T = Foo> {
    // TSError: Type parameter 'T' has a circular default.
    prop0: T
}
```
