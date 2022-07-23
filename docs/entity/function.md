## Entity: Function

A `Function Entity` is either a block of code defined with
keyword `function` or an arrow function `() => {}`.

### Supported Pattern

```yaml
name: Function declaration
```

#### Syntax: Function Definitions

```text
FunctionDeclaration :
    `function` BindingIdentifier `(` FormalParameters `)` `{` FunctionBody `}`
    `function` `(` FormalParameters `)` `{` FunctionBody `}` /* Default */

FunctionBody :
    FunctionStatementList

FunctionStatementList :
    [StatementList]
```

##### Examples

This part illustrates the basic usage of declaring functions
using `function`.

###### Function declaration with name

```js
function foo() {
    /* Empty */
}
```

```yaml
name: Named function declaration
entity:
    type: function
    extra: false
    items:
        -   name: foo
            loc: 1:10
```

###### Function declaration without name

> An anonymous FunctionDeclaration can only occur as part of
> an `export default` declaration (Same as below if a syntax
> item is marked as `/* Default */`).

```js
export default function () {
    /* Empty */
}
```

```yaml
name: Unnamed function declaration
entity:
    type: function
    extra: false
    items:
        -   name: <Anonymous as="Function">
            loc: 1:16:0
```

#### Syntax: Arrow Function Definitions

```text
ArrowFunction :
    ArrowParameters `=>` ConciseBody

ConciseBody :
    ExpressionBody
    `{` FunctionBody `}`
```

##### Examples

###### Arrow function with concise body

```js
() => foo();
```

```yaml
name: Arrow function
entity:
    type: function
    extra: false
    items:
        -   name: <Anonymous as="ArrowFunction">
            loc: 1:1:0
```

#### Syntax: Generator Function Definitions

```text
GeneratorDeclaration :
    `function` `*` BindingIdentifier `(` FormalParameters `)` `{` GeneratorBody `}`
    `function` `*` `(` FormalParameters `)` `{` GeneratorBody `}` /* Default */

GeneratorBody :
    FunctionBody

YieldExpression :
    `yield`
    `yield` AssignmentExpression
    `yield` `*` AssignmentExpression
```

##### Examples

###### Generator function

```js
function* foo() {
    /* Empty */
}

export default function* () {
    /* Empty */
}
```

```yaml
name: Generator function
entity:
    type: function
    extra: false
    items:
        -   name: foo
            loc: 1:11
            generator: true
        -   name: <Anonymous as="Function">
            loc: 5:16:0
            generator: true
```

#### Syntax: Async Generator Function Definitions

```text
AsyncGeneratorDeclaration :
    `async function` `*` BindingIdentifier `(` FormalParameters `)` `{` AsyncGeneratorBody `}`
    `async function` `*` `(` FormalParameters `)` `{` AsyncGeneratorBody `}` /* Default */

AsyncGeneratorBody :
    FunctionBody
```

##### Examples

###### Async generator function

```js
async function* foo() {
    /* Empty */
}

export default async function* () {
    /* Empty */
}
```

```yaml
name: Async generator function
entity:
    type: function
    extra: false
    items:
        -   name: foo
            loc: 1:17
            generator: true
            async: true
        -   name: <Anonymous as="Function" />
            loc: 5:16:0
            generator: true
            async: true
```

#### Syntax: Async Function Definitions

```text
AsyncFunctionDeclaration :
    `async function` BindingIdentifier `(` FormalParameters `)` `{` AsyncFunctionBody `}`
    `async function` `(` FormalParameters `)` `{` AsyncFunctionBody `}` /* Default */

AsyncFunctionBody :
    FunctionBody

AwaitExpression :
    `await` UnaryExpression
```

##### Examples

###### Async function

```js
async function foo() {
    /* Empty */
}

export default async function () {
    /* Empty */
}
```

```yaml
name: Async function
entity:
    type: function
    extra: false
    items:
        -   name: foo
            loc: 1:16
            async: true
        -   name: <Anonymous as="Function">
            loc: 5:16:0
            async: true
```

#### Syntax: Async Arrow Function Definitions

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

##### Examples

###### Async arrow function

```js
async () => {
    /* Empty */
}
```

```yaml
name: Async arrow function
entity:
    type: function
    extra: false
    items:
        -   name: <Anonymous as="ArrowFunction">
            loc: 1:1:0
            async: true
```

> <a name="und_async_function" />If a function is declared
> with keyword `async`, `und`'s results of code
> location will always start after the `async`, which is
> hard to simulate this behaviour with `@babel/parser`.

#### Syntax: Function Expressions

```text
FunctionExpression :
    `function` [BindingIdentifier] `(` FormalParameters `)` `{` FunctionBody `}`

GeneratorExpression :
    `function` `*` [BindingIdentifier] `(` FormalParameters `)` `{` GeneratorBody `}`

AsyncGeneratorExpression :
    `async function` `*` [BindingIdentifier] `(` FormalParameters `)` `{` AsyncGeneratorBody `}`

AsyncFunctionExpression :
    `async function` [BindingIdentifier] `(` FormalParameters `)` `{` AsyncFunctionBody `}`
```

Function expression is defining a function inside an expression,
which is far more complicated than what it looks like,
see [this page](https://kangax.github.io/nfe/#example_1_function_expression_identifier_leaks_into_an_enclosing_scope)
for a more clear understanding.

##### Examples

###### Function expression

```js
const foo = function bar() {
    /* Empty */
}

const baz = function () {
    /* Empty */
}
```

```yaml
name: Function expression
entity:
    type: function
    extra: false
    items:
        -   name: bar
            loc: 1:22
        -   name: baz
            loc: 5:13
```

> <a name="und_unnamed_function_expression" />`und`
> treats `baz` as an `Function Entity`, which may lose
> the information about the kind of this variable.
> If `baz` is declared as `const`, then it's not possible
> to reassign it with another value, which is allowed in
> `let` or `var`.
