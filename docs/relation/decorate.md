## Relation: Decorate

A `Decorate Relation` establishes a link between two entities that one callable entity decorate a class or class elements.

> There are multiple proposals that define the syntax of decorators. ENRE supports only the TC39 `2023-01` version, which will be the official standard in the future version of ECMAScript. Continue reading [babel's page](https://babeljs.io/docs/babel-plugin-proposal-decorators#version) to know more about proposals' differences of different versions, the [official proposal](https://github.com/tc39/proposal-decorators#how-does-this-proposal-compare-to-other-versions-of-decorators), and this extensive [blog](https://2ality.com/2022/10/javascript-decorators.html).

### Supported Patterns

```yaml
name: Decorate
```

#### Syntax: Decorate

```text
DecoratorList :
    [DecoratorList] Decorator

Decorator :
    `@` DecoratorMemberExpression
    `@` DecoratorParenthesizedExpression
    `@` DecoratorCallExpression

DecoratorMemberExpression :
    IdentifierReference
    DecoratorMemberExpression `.` IdentifierName
    DecoratorMemberExpression `.` PrivateIdentifier

DecoratorParenthesizedExpression :
    `(` Expression `)`

DecoratorCallExpression :
    DecoratorMemberExpression Arguments
```

##### Examples

###### Simple method decorator

A method decorator returns a new function that would replace the decorated one, or void in the case of not modifying original method.

```ts
function foo(target, context) {
    /**
     * Decorators are functions in form that require specific parameters.
     * This decorator simply does nothing to the decorated element.
     */
    return target;
}

class Clz {
    @foo bar() { /* Empty */ }
}
```

```yaml
name: Simple method decorator
entity:
    items:
        -   name: foo
            type: function
            loc: 1:10
        -   name: bar
            type: method
            loc: 10:10
relation:
    type: decorate
    extra: false
    items:
        -   from: function:'foo'
            to: method:'bar'
            loc: 10:6
```

###### Simple field decorator

A field decorator should return a function that accepts a (field) value and returns a modified value.

```ts
function double(_/* undefined for fields */, __) { return v => v*2 }

class Clz {
    @double field = 2;
}

console.log(new Clz().field)    // 4
```

```yaml
name: Simple field decorator
entity:
    items:
        -   name: double
            type: function
            loc: 1:10
relation:
    type: decorate
    extra: false
    items:
        -   from: function:'double'
            to: field:'field'
            loc: 4:6
```

###### Simple class decorator

```ts
function foo(target, context) { return target };

@foo class Clz { /* Empty */ }
```

```yaml
name: Simple class decorator
relation:
    type: decorate
    extra: false
    items:
        -   from: function:'foo'
            to: class:'Clz'
            loc: 3:2
```
