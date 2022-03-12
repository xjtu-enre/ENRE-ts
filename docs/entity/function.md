## Entity: Function

A `Function Entity` is either a block of code defined with keyword `function` or an arrow function `() => {}`.

### Supported pattern

```yaml
name: functionDeclaration
```

**Syntax:**

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
function foo() {
}
```

```yaml
name: emptyFunctionWithName
filter: function
entities:
    -   name: foo
        loc: [ 1, 10 ]
```

* A simple function declaration without name

> An anonymous FunctionDeclaration can only occur as part of an `export default` declaration.

```js
export default function () {
}
```

```yaml
name: exportDefaultFunction
filter: function
entities:
    -   name: <anonymous type="function" />
        loc: [ 1, 25 ]
```

**Syntax:**

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
name: arrowFunctionWithConciseBody
filter: function
entities:
    -   name: <anonymous type="arrowFunction" />
        loc: [ 1, 1 ]
```

**Syntax:**

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
