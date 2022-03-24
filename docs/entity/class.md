## Entity: Class

A `Class Entity` is a template of object containing variables and
functions defined by keyword `class`.

### Supported pattern

```yaml
name: classDeclaration
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

ClassHeritage :
    `extends` LeftHandSideExpression

ClassBody :
    ClassElementList
```

**Examples:**

* Simple class declaration

```js
class foo {
    /* Empty */
}
```

```yaml
name: simpleClassDeclaration
entities:
    filter: class
    exact: true
    items:
        -   name: foo
            loc: [ 1, 7 ]
```
