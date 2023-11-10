## Relation: Override

An `Override Relation` establishes a link between two `Method Entity`s that a subclass one overrides a superclass one.

To override the constructor, a subclass must call `super(...)`BEFORE any field assignments `this.* = *` in its
constructor, or `this` would be undefined. Continue
reading [this tutorial](https://javascript.info/class-inheritance#overriding-constructor) to learn more.

### Supported Patterns

```yaml
name: Relation override
```

#### Semantic: Override patterns

Since JavaScript does not have a type system built-in, it does not utilize a method type signature checking as Java
would do to determine whether a method from a subclass is or is not an override of a method in superclass.

##### Examples

###### Subclass overrides method

```js
class Foo {
    method0() {
        console.log('Foo')
    }

    get a() {
        return 0;
    }
}

class Bar extends Foo {
    method0() {
        console.log('Bar')
    }

    get a() {
        return 1;
    }
}

new Bar().method0() // 'Bar'
new Bar().a // 1
```

```yaml
name: Subclass overrides method
relation:
    type: override
    extra: false
    items:
        -   from: method:'Bar.method0'
            to: method:'Foo.method0'
            loc: file0:12:5
        -   from: method:'Bar.a'[@kind=get]
            to: method:'Foo.a'[@kind=get]
            loc: file0:16:9
```

###### Subclass overrides constructor

```js
class Foo {
    constructor() {
        this.foo = 0;
    }
}

class Bar extends Foo {
    constructor() {
        super();        // Necessary for use `this` later
        this.bar = 1;
    }
}
```

```yaml
name: Subclass overrides constructor
relation:
    type: override
    extra: false
    items:
        -   from: method:'Bar.constructor'
            to: method:'Foo.constructor'
            loc: file0:8:5
```

###### Subclass overrides field

```js
class Foo {
    field0 = 0

    constructor() {
        this.field1 = 10;
    }
}

class Bar extends Foo {
    field0 = 1

    constructor() {
        this.field1 = 11;
    }
}

new Bar().field0 // 1
```

```yaml
name: Subclass overrides field
relation:
    type: override
    items:
        -   from: field:'Bar.field0'
            to: field:'Foo.field0'
            loc: file0:10:5
        -   from: field:'Bar.field1'
            to: field:'Foo.field1'
            loc: file0:13:9
```

###### Getter/Setter cannot override field

Methods may be kinds of `constructor`/`method`/`get`/`set`, a `getter` or `setter` uses the same syntax as field when
used, however, a `getter` or `setter` will not override a field.

```js
class Foo {
    a = 0;
}

class Bar extends Foo {
    get a() {
        return 1;
    }
}

new Bar().a // 0
```

```yaml
name: getter cannot override field
relation:
    type: override
    extra: false
    items:
        -   from: method:'Bar.a'
            to: field:'Foo.a'
            loc: file0:6:9
            negative: true
```

### Properties

| Name | Description | Type | Default |
|------|-------------|:----:|:-------:|
