## Relation: Call

A `Call Relation` establishes a link between an upper entity and
any other entities which are callable that the latter one is
called within the former one's scope.

### Supported Patterns

```yaml
name: Relation call
```

#### Syntax: Call

```text
CallExpression :
    CoverCallExpressionAndAsyncArrowHead
    SuperCall
    ImportCall
    CallExpression Arguments
    CallExpression `[` Expression `]`
    CallExpression `.` IdentifierName
    CallExpression TemplateLiteral
    CallExpression `.` PrivateIdentifier

CoverCallExpressionAndAsyncArrowHead :
    MemberExpression Arguments

Arguments :
    `(` `)`
    `(` ArgumentList `)`
    `(` ArgumentList `,` `)`

SuperCall :
    `super` Arguments

ImportCall :
    `import` `(` AssignmentExpression `)`
```

##### Examples

###### File calls callables

```js
function foo() {
    return () => {
        /* Empty */
    }
}

class Foo {
    /**
     * When a class is 'called', it is actually the
     * constructor that is been called.
     */
    constructor() {
        /* Empty */
    }

    method0() {
        /* Empty */
    }
}

const baz = {
    prop: () => {
        /* Empty */
    }
}

const bar = foo();
bar();

new Foo().method0();

baz.prop();

/**
 * A function can also be called with `new`.
 * This is a convenient way to create a object and assign properties.
 */
function NewFunction() {
    this.prop = 1;
}

new NewFunction().prop // 1
```

```yaml
name: File call callables
relation:
    type: call
    extra: false
    items:
        -   from: file:'file0'
            to: function:'foo'
            loc: file0:27:13
        -   from: file:'file0'
            to: variable:'bar'
            loc: file0:28:1
        -   from: file:'file0'
            to: class:'Foo'
            loc: file0:30:5
        -   from: file:'file0'
            to: method:'Foo.constructor'
            loc: file0:30:5
        -   from: file:'file0'
            to: method:'Foo.method0'
            loc: file0:30:11
        -   from: file:'file0'
            to: property:'baz.prop'
            loc: file0:32:5
        -   from: file:'file0'
            to: function:'NewFunction'
            loc: file0:42:5
```
