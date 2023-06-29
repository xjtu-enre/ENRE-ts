## Relation: Modify

A `Modify Relation` establishes a link between an upper entity and any other named value entities which appear on both
sides of assignment expressions or unary operators.

### Supported Patterns

```yaml
name: Relation modify
```

#### Syntax: Modify

```text
AssignmentExpression :
    ...
    LeftHandSideExpression AssignmentOperator AssignmentExpression
    LeftHandSideExpression `&&=` AssignmentExpression
    LeftHandSideExpression `||=` AssignmentExpression
    LeftHandSideExpression `??=` AssignmentExpression

AssignmentOperator : one of
    `*=` `/=` `%=` `+=` `-=` `<<=` `>>=` `>>>=` `&=` `^=` `|=` `**=`
    
UpdateExpression :
    LeftHandSideExpression
    LeftHandSideExpression /* no LineTerminator here */ `++`
    LeftHandSideExpression /* no LineTerminator here */ `--`
    `++` UnaryExpression
    `--` UnaryExpression
```

##### Examples

###### Operators that can perform modify

```js
let a = 1;

a++;
++a;
a--;
--a;
a *= 1;
a /= 1;
a %= 1;
a += 1;
a -= 1;
a <<= 1;        // Left shift assignment
a >>= 1;        // Right shift assignment
a >>>= 1;       // Unsigned right shift assignment 
a &= 1;
a ^= 1;
a |= 1;
a **= 1;

// Short-circuit logical evaluation and assignments
a &&= 'aaa'     // Equvalent to a && (a = 'aaa')
a ||= 'aaa'     // Equvalent to a || (a = 'aaa')
a ??= 'aaa'     // Equvalent to a ?? (a = 'aaa')
```

```yaml
name: Operators that can perform modify
relation:
    type: modify
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:3:1
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:4:3
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:5:1
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:6:3
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:7:1
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:8:1
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:9:1
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:10:1
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:11:1
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:12:1
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:13:1
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:14:1
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:15:1
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:16:1
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:17:1
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:18:1
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:21:1
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:22:1
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:23:1
```

###### `const` variables cannot be modified

```js
const a = 1;
a++;
```

```yaml
name: Const variables cannot be modified
relation:
    type: modify
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: variable:'a'
            loc: file0:2:1
            negative: true
```

### Properties

| Name | Description | Type | Default |
|------|-------------|:----:|:-------:|
