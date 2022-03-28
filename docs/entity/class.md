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

* Default export anonymous class

```js
export default class {
    /* Empty */
}
```

```yaml
name: defaultExportAnonymousClass
entities:
    filter: class
    exact: true
    items:
        -   name: <anonymous type="class" />
            loc: [ 1, 16 ]
```

* Default export named class

```js
export default class foo {
    /* Empty */
}
```

```yaml
name: defaultExportNamedClass
entities:
    filter: class
    exact: true
    items:
        -   name: foo
            loc: [ 1, 22 ]
```

* Class expression

```js
const foo = class {
    /* Empty */
}

const bar = class baz {
    /* Empty */
}
```

```yaml
name: classExpression
entities:
    filter: class
    exact: true
    items:
        -   name: <anonymous type="class" />
            loc: [ 1, 13 ]
        -   name: baz
            loc: [ 5, 19 ]
```
