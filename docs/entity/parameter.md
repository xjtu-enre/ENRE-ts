## Entity: Parameter

A `Parameter Entity` is a variable defined either as function's
formal parameter or in a `catch` clause.

### Supported pattern

```yaml
name: parameterDeclaration
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

**Examples:**

* Traditional function parameters

```js
function foo({a, b: [c, {d}, ...e], f: {}, ...g}, h = 0, ...r) {
    /* Empty */
}
```

```yaml
name: functionParameters
entities:
    filter: parameter
    exact: true
    items:
        -   name: a
            loc: [ 1, 15 ]
        -   name: c
            loc: [ 1, 22 ]
        -   name: d
            loc: [ 1, 26 ]
        -   name: e
            loc: [ 1, 33 ]
        -   name: g
            loc: [ 1, 47 ]
        -   name: h
            loc: [ 1, 51 ]
        -   name: r
            loc: [ 1, 61 ]
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

* Single parameter in arrow function

```js
a => {
    /* Empty */
}
```

```yaml
name: singleParameterInArrowFunction
entities:
    filter: parameter
    exact: true
    items:
        -   name: a
            loc: [ 1, 1 ]
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

**Examples:**

* Catch clause with simple parameter

```js
try {
    /* Empty */
} catch (e) {
    /* Empty */
}
```

```yaml
name: catchClauseWithParameter
entities:
    filter: parameter
    exact: true
    items:
        -   name: e
            loc: [ 3, 10 ]
```

* Catch clause with no parameter

```js
try {
    /* Empty */
} catch {
    /* Empty */
}
```

```yaml
name: catchClauseWithNoParameter
entities:
    filter: parameter
    exact: true
    items: [ ]
```

* Identifier can be destructured

```js
try {
    /* Empty */
} catch ({a, b: [c, {d}, ...e], f: {}, ...g}) {
    /* Empty */
}
```

```yaml
name: destructuringCatchParameter
entities:
    filter: parameter
    exact: true
    items:
        -   name: a
            loc: [ 3, 11 ]
        -   name: c
            loc: [ 3, 18 ]
        -   name: d
            loc: [ 3, 22 ]
        -   name: e
            loc: [ 3, 29 ]
        -   name: g
            loc: [ 3, 43 ]
```
