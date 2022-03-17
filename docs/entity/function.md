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

* A simple function declaration with name

```js
function foo() {}
```

```yaml
name: emptyFunctionWithName
filter: function
entities:
    -   name: foo
        loc: [ 1, 1, 0 ]
```

* A simple function declaration without name

> An anonymous FunctionDeclaration can only occur as part of an `export default` declaration.

```js
export default function () {}
```

```yaml
name: exportDefaultFunction
filter: function
entities:
    -   name: <anonymous type="function" />
        loc: [ 1, 16, 0 ]
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
filter: function
entities:
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
filter: function
entities:
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
filter: function
entities:
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
filter: function
entities:
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
filter: function
entities:
    -   name: <anonymous type="arrowFunction" />
        loc: [ 1, 1, 0 ]
        async: true
```
