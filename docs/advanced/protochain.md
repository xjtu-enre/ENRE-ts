## Protochain

In JavaScript, when using an object's properties or methods, it first searches within the object itself, then proceeds to look up along the prototype chain until it finds the property or method or reaches the end of the prototype chain.

### Supported Patterns

```yaml
name: Implicit Protochain
```

#### Semantic: Protochain

##### Examples

###### Basic

<!-- mro/basic -->

```js
class A {
    func() {
        /* Empty */
    }
}

class B extends A {
}

const b = new B();
b.func();
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.js>'
            to: method:'A.func'
            loc: 11:1:1
```

###### Basic Init

<!-- mro/basic_init -->

```js
class A {
  constructor() {
    /* Empty */
  }
}

class B extends A {
  func() {
    /* Empty */
  }
}

const b = new B();
b.func();
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.js>'
            to: method:'A.constructor'
            loc: 14:1:1
        -   from: file:'<File file0.js>'
            to: method:'B.func'
            loc: 14:1:1
```

###### Parents Same class extend

<!-- mro/parents_same_superclass -->

```js
class A {
  constructor() {
    /* Empty */
  }

  func() {
    /* Empty */
  }
}

class B extends A {
  // Donnt need to define constructor or func, as it inherits from class A
}

class C extends A {
  func() {
    /* Empty */
  }
}

class D extends B {
  // Donnt need to define constructor or func, as it inherits from class B
}

const d = new D();
d.func();
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.js>'
            to: method:'C.func'
            loc: 26:1:1
```

###### Self Assignment

<!-- mro/self_assignment -->

```js
class B {
  funcb() {
    this.smth = this.func;
  }

  func() {
    /* Empty */
  }
}

class A extends B {
  funca() {
    this.smth = this.func;
  }

  func() {
    /* Empty */
  }
}

const a = new A();
a.funcb();
a.smth();

a.funca();
a.smth();
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.js>'
            to: method:'B.funcb'
            loc: 22:1:1
        -   from: file:'<File file0.js>'
            to: method:'A.func'
            loc: 23:1:1
        -   from: file:'<File file0.js>'
            to: method:'A.funca'
            loc: 25:1:1
        -   from: file:'<File file0.js>'
            to: method:'A.func'
            loc: 26:1:1
```

###### Super Call

<!-- mro/super_callc -->

```js
class A {
  constructor() {
    /* Empty */
  }
}

class B extends A {
  constructor() {
    super();
  }
}

class C extends B {
  constructor() {
    super();
  }
}

const c = new C();
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.js>'
            to: method:'C.constructor'
            loc: 19:7:1
        -   from: method:'C.constructor'
            to: method:'B.constructor'
            loc: 15:5:5
        -   from: method:'B.constructor'
            to: method:'A.constructor'
            loc: 9:5:5
```

###### Two Parents

<!-- mro/two_parents -->

```js
class A {
  func() {
    /* Empty */
  }
}

class B {
  constructor() {
    /* Empty */
  }

  func() {
    /* Empty */
  }
}

class C extends A {
  constructor() {
    super();
    B.call(this);
  }
}

const c = new C();
c.func();
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.js>'
            to: method:'B.constructor'
            loc: 25:1:1
        -   from: file:'<File file0.js>'
            to: method:'A.func'
            loc: 25:1:1
```

###### Two Parents Mehtod Define

<!-- mro/two_parents_method_defined -->

```js
class A {
  constructor() {
    /* Empty */
  }
}

class B {
  func() {
    /* Empty */
  }
}

class C extends A {
  constructor() {
    super();
    /* Empty */
  }

  func() {
    /* Empty */
  }
}

const c = new C();
c.func();
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.js>'
            to: method:'C.constructor'
            loc: 26:1:1
        -   from: file:'<File file0.js>'
            to: method:'C.func'
            loc: 26:1:1
```
