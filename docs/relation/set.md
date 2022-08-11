## Relation: Set

A `Set Relation` establishes a link between an upper entity and
any other named value entities which appear on the left side of
assignment expressions.

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
        -   from: file:'file0'
            to: variable:'a'
            loc: file0:1:5
            init: true
        -   from: file:'file0'
            to: variable:'a'
            loc: file0:2:1
```
