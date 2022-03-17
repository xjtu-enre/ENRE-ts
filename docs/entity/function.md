## Entity: Function

A `Function Entity` is either a block of code defined with keyword `function` or an arrow function `() => {}`.

### Supported pattern

```yaml
name: functionDeclaration
```

**Syntax: Function Definitions**

```text
FunctionDeclaration :
    `function` BindingIdentifier `(` FormalParameters `)` `{` FunctionBody `}`
    `function` `(` FormalParameters `)` `{` FunctionBody `}`

FunctionExpression :
    `function` [BindingIdentifier] `(` FormalParameters `)` `{` FunctionBody `}`

FunctionBody :
    FunctionStatementList

FunctionStatementList :
    [StatementList]
```

**Examples:**

This part illustrates the basic usage of declaring functions using `function`.

* Function declaration with name

```js
function foo() {}
```

```yaml
name: namedFunctionDeclaration
entities:
    filter: function
    exact: true
    items:
        -   name: foo
            loc: [ 1, 1, 0 ]
```

* Function declaration without name

> An anonymous FunctionDeclaration can only occur as part of an `export default` declaration.

```js
export default function () {}
```

```yaml
name: unnamedFunctionDeclaration
entities:
    filter: function
    exact: true
    items:
        -   name: <anonymous type="function" />
            loc: [ 1, 16, 0 ]
```

* Function expression

```js
const foo = function bar () {}
```

```yaml
name: functionExpression
entities:
    filter: function
    exact: true
    items:
        -   name: bar
            loc: [ 1, 13, 0 ]
```

**Syntax: Arrow Function Definitions**

```text
ArrowFunction :
    ArrowParameters `=>` ConciseBody

ConciseBody :
    ExpressionBody
    `{` FunctionBody `}`
```

**Examples:**

* Arrow function with concise body

```js
() => foo();
```

```yaml
name: arrowFunction
entities:
    filter: function
    exact: true
    items:
        -   name: <anonymous type="arrowFunction" />
            loc: [ 1, 1, 0 ]
```

**Syntax: Generator Function Definitions**

```text
GeneratorDeclaration :
    `function` `*` BindingIdentifier `(` FormalParameters `)` `{` GeneratorBody `}`
    `function` `*` `(` FormalParameters `)` `{` GeneratorBody `}`

GeneratorExpression :
    `function` `*` [BindingIdentifier] `(` FormalParameters `)` `{` GeneratorBody `}`

GeneratorBody :
    FunctionBody

YieldExpression :
    `yield`
    `yield` AssignmentExpression
    `yield` `*` AssignmentExpression
```

**Examples:**

* Generator function

```js
function * foo () {}
```

```yaml
name: generatorFunction
entities:
    filter: function
    exact: true
    items:
        -   name: foo
            loc: [ 1, 1, 0 ]
            generator: true
```

**Syntax: Async Generator Function Definitions**

```text
AsyncGeneratorDeclaration :
    `async function` `*` BindingIdentifier `(` FormalParameters `)` `{` AsyncGeneratorBody `}`
    `async function` `*` `(` FormalParameters `)` `{` AsyncGeneratorBody `}`

AsyncGeneratorExpression :
    `async function` `*` [BindingIdentifier] `(` FormalParameters `)` `{` AsyncGeneratorBody `}`

AsyncGeneratorBody :
    FunctionBody
```

**Examples:**

* Async generator function

```js
async function * foo () {}
```

```yaml
name: asyncGeneratorFunction
entities:
    filter: function
    exact: true
    items:
        -   name: foo
            loc: [ 1, 1, 0 ]
            generator: true
            async: true
```

**Syntax: Async Function Definitions**

```text
AsyncFunctionDeclaration :
    `async function` BindingIdentifier `(` FormalParameters `)` `{` AsyncFunctionBody `}`
    `async function` `(` FormalParameters `)` `{` AsyncFunctionBody `}`

AsyncFunctionExpression :
    `async function` [BindingIdentifier] `(` FormalParameters `)` `{` AsyncFunctionBody `}`

AsyncFunctionBody :
    FunctionBody

AwaitExpression :
    `await` UnaryExpression
```

**Examples:**

```js
async function foo () {}
```

```yaml
name: asyncFunction
entities:
    filter: function
    exact: true
    items:
        -   name: foo
            loc: [ 1, 1, 0 ]
            async: true
```

**Syntax: Async Arrow Function Definitions**

```text
AsyncArrowFunction :
    `async` AsyncArrowBindingIdentifier `=>` AsyncConciseBody
    CoverCallExpressionAndAsyncArrowHead `=>` AsyncConciseBody

AsyncConciseBody :
    ExpressionBody
    `{` AsyncFunctionBody `}`

AsyncArrowBindingIdentifier :
    BindingIdentifier

CoverCallExpressionAndAsyncArrowHead :
    MemberExpression Arguments
```

**Examples:**

```js
async () => {}
```

```yaml
name: asyncArrowFunction
entities:
    filter: function
    exact: true
    items:
        -   name: <anonymous type="arrowFunction" />
            loc: [ 1, 1, 0 ]
            async: true
```
