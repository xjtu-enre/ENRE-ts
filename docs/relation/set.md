## Relation: Set

A `Set Relation` establishes a link between an upper entity and any other named value
entities which appear on the left side of assignment expressions.

### Supported Patterns

```yaml
name: Relation set
```

#### Syntax: Set

```text
AssignmentExpression :
    LeftHandSideExpression `=` AssignmentExpression
    ...
```

##### Examples

###### Set lexical element

```js
let a = 1;
a = 2;
```

```yaml
name: Set lexical element
relation:
    type: set
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:1:5
            init: true
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:2:1
```

###### `const` variables cannot be re-set

```js
const a = 1;
a = 1;
```

```yaml
name: Const variables cannot be re-set
relation:
    type: set
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:1:7
            init: true
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:2:1
            negative: true
```

### Properties

| Name   | Description                                                 |   Type    | Default |
|--------|-------------------------------------------------------------|:---------:|:-------:|
| isInit | Indicates an item is set immediately after the declaration. | `boolean` | `false` |

