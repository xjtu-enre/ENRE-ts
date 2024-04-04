## Classes

Various explicit and implicit class member usages.

### Supported Patterns

```yaml
name: Implicit Class Calls 
```

<!--pycg:classes/base_class_attr unnecessary-->
<!--pycg:classes/direct_call explicit-->
<!--pycg:classes/imported_attr_access explicit-->
<!--pycg:classes/imported_call explicit-->
<!--pycg:classes/imported_call_without_init explicit-->
<!--pycg:classes/imported_nested_attr_access unnecessary-->
<!--pycg:classes/instance explicit-->
<!--pycg:mro/parents_same_superclass unsupported-->
<!--pycg:mro/two_parents unsupported-->
<!--pycg:mro/two_parents_method_defined unsupported-->

#### Semantic: Class

##### Examples

###### Call and assigned call

<!--pycg:classes/call-->
<!--pycg:classes/assigned_call-->

```js
class MyClass {
    func() {
        /* Empty */
    }
}

const a = new MyClass();
a.func();

const b = a.func;
b();
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: class:'MyClass'
            loc: 7:15
        -   from: file:'<File file0.js>'
            to: method:'func'
            loc: 8:3
            by: ~
        -   from: file:'<File file0.js>'
            to: method:'func'
            loc: 11:1:1
            by: variable:'b'
```

###### Access sibling method through `this`

<!--pycg:classes/assigned_self_call-->

```js
class MyClass {
    func1() {
        /* Empty */
    }

    func2() {
        const a = this;
        a.func1();
    }
}

const a = new MyClass();
a.func2();
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: class:'MyClass'
            loc: 12:15
        -   from: file:'<File file0.js>'
            to: method:'func2'
            loc: 13:3
            by: ~
        -   from: method:'func2'
            to: method:'func1'
            loc: 8:11
            by: ~
```

###### Access sibling method through `this` 2

`this` in JavaScript does not follow the syntactic scope, but rather the runtime
scope, (`this` is bound to corresponding `this` where it is invoked, not where it is
defined). In this case, a new variable `b` points to `func2`, and when `b` is finally
invoked, `this` is bound to the global `this`, which is `undefined`, and the
internal `a.func1` is also `undefined` consequently.

```js
class MyClass {
    func1() {
        /* Empty */
    }

    func2() {
        const a = this;
        a.func1();
    }
}

const a = new MyClass();
const b = a.func2;
b();                    // JSError: undefined is not an object (evaluating 'a.func1')
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: class:'MyClass'
            loc: 12:15
        -   from: file:'<File file0.js>'
            to: method:'func2'
            loc: 14:1:1
            by: variable:'b'
        -   from: method:'func2'
            to: method:'func1'
            loc: 8:11
            by: ~
            negative: true
```

###### Base Class Calls Child

<!--pycg:classes/base_class_calls_child-->

```js
class A {
    func() {
        this.child();
    }
}

class B extends A {
    constructor() {
        super();
        this.child = this.func2;
    }

    func2() {
        /* Empty */
    }
}

class C extends A {
    constructor() {
        super();
        this.child = this.func2;
    }

    func2() {
        /* Empty */
    }
}

const b = new B();
b.func();

const c = new C();
c.func();
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: class:'B'
            loc: 29:15
        -   from: file:'<File file0.js>'
            to: class:'C'
            loc: 32:15
        -   from: method:'B.constructor'
            to: class:'A'
            loc: 9:9:5
        -   from: method:'C.constructor'
            to: class:'A'
            loc: 20:9:5
        -   from: method:'func'
            to: method:'B.func2'
            loc: 3:14:5
            by: ~
        -   from: method:'func'
            to: method:'C.func2'
            loc: 3:14:5
            by: ~
```

###### Nested Call

<!--pycg:classes/nested_call-->

```js
class MyClass {
    func() {
        function nested0() {
            /* Empty */
        }

        nested0();

        const nested1 = () => {
            /* Empty */
        }

        nested1();
    }
}
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: method:'func'
            to: method:'nested0'
            loc: 7:9
        -   from: method:'func'
            to: variable:'nested1'
            loc: 13:9
```

###### Nested Class Calls

<!--pycg:classes/nested_class_calls-->

```js
class C {
    func() {
        /* Empty */
    }
}

class B {
    constructor(c) {
        this.c = c;
    }

    func() {
        this.c.func();
    }
}

class A {
    constructor() {
        this.c = new C();
    }

    func() {
        const b = new B(this.c);
        b.func();
    }
}

const a = new A();
a.func();
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: method:'A.constructor'
            loc: 28:15:1
        -   from: file:'<File file0.js>'
            to: method:'A.func'
            loc: 29:3
            by: ~
        -   from: method:'A.constructor'
            to: class:'C'
            loc: 19:22
        -   from: method:'A.func'
            to: method:'B.constructor'
            loc: 23:23:1
        -   from: method:'A.func'
            to: method:'B.func'
            loc: 24:11
            by: ~
        -   from: method:'B.func'
            to: method:'C.func'
            loc: 13:16
            by: ~
```

###### Parameter Call

<!--pycg:classes/parameter_call-->

```js
class MyClass {
    func3() {
        /* Empty */
    }

    func2(a) {
        a();
    }

    func1(a, b) {
        a(b);
    }
}

const a = new MyClass();
a.func1(a.func2, a.func3);
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: class:'MyClass'
            loc: 15:15
        -   from: file:'<File file0.js>'
            to: method:'func1'
            loc: 16:3
            by: ~
        -   from: method:'func1'
            to: method:'func2'
            loc: 11:9:1
            by: parameter:'MyClass.func1.a'
        -   from: method:'func2'
            to: method:'func3'
            loc: 7:9:1
            by: parameter:'MyClass.func2.a'
```

###### Call returned function

<!--pycg:classes/return_call-->
<!--pycg:classes/return_call_direct-->

```js
class MyClass {
    func2() {
        /* Empty */
    }

    func1() {
        return this.func2;
    }
}

const a = new MyClass();
const b = a.func1();
b();

a.func1()();
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: class:'MyClass'
            loc: 11:15
        -   from: file:'<File file0.js>'
            to: method:'func1'
            loc: 12:13
            by: ~
        -   from: file:'<File file0.js>'
            to: method:'func2'
            loc: 13:1:1
            by: variable:'b'
        -   from: file:'<File file0.js>'
            to: method:'func1'
            loc: 15:3
            by: ~
        -   from: file:'<File file0.js>'
            to: method:'func2'
            loc: 15:10:0
            by: ~
```

###### Field assignments

<!--pycg:classes/self_assignment-->
<!--pycg:classes/self_assign_func-->

```js
class A {
    func() {
        /* Empty */
    }
}

class B {
    constructor(a) {
        this.a = a;
        this.b = this.func2;
    }

    func() {
        this.a.func();
        this.b();
    }

    func2() {
        /* Empty */
    }
}

const a = new A();
const b = new B(a);
b.func();
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: class:'A'
            loc: 23:15
        -   from: file:'<File file0.js>'
            to: method:'B.constructor'
            loc: 24:15:1
        -   from: file:'<File file0.js>'
            to: method:'B.func'
            loc: 25:3
            by: ~
        -   from: method:'B.func'
            to: method:'A.func'
            loc: 14:16
            by: ~
        -   from: method:'B.func'
            to: method:'B.func2'
            loc: 15:14
            by: ~
```

###### Field assignments 2

```js
function func2() {
    /* Empty */
}

class A {
    constructor() {
        this.func = func1;          // `this` is not used, thus does not refer to A.func1
        this.func();                // JSError: Can't find variable: func1

        this.func3 = func2;         // Refers to <File file0.js>.func2
        this.func3();
    }

    func1() {
        /* Empty */
    }

    func2() {
        /* Empty */
    }
}

new A();
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: method:'A.constructor'
            loc: 23:5:1
        -   from: method:'constructor'
            to: method:'func1'
            loc: 8:14:4
            by: ~
            negative: true
        -   from: method:'constructor'
            to: method:'A.func2'
            loc: 11:14:4
            by: ~
            negative: true
        -   from: method:'constructor'
            to: method:'func2'[@loc=1]
            loc: 11:14:4
            by: ~
```

###### Self Call

<!--pycg:classes/self_call-->

```js
class MyClass {
    constructor() {
        this.func1();
    }

    func1() {
        /* Empty */
    }

    func2() {
        this.func1();
    }
}

const a = new MyClass();
a.func2();
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: method:'constructor'
            loc: 15:15:7
        -   from: file:'<File file0.js>'
            to: method:'func2'
            loc: 16:3
            by: ~
        -   from: method:'constructor'
            to: method:'func1'
            loc: 3:14
            by: ~
        -   from: method:'func2'
            to: method:'func1'
            loc: 11:14
            by: ~
```

###### Method Call

<!--pycg:classes/static_method_call-->

```js
class MyClass {
    static func() {
        /* Empty */
    }
}

MyClass.func();
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: method:'func'
            loc: 7:9
```

###### Return super class's member

<!--pycg:classes/super_class_return-->

```js
class A {
    func1() {
        /* Empty */
    }
}

class B extends A {
    func2() {
        return this.func1;
    }
}

const b = new B();
const fn = b.func2();
fn();
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: class:'B'
            loc: 13:15
        -   from: file:'<File file0.js>'
            to: method:'B.func2'
            loc: 14:14
            by: ~
        -   from: file:'<File file0.js>'
            to: method:'A.func1'
            loc: 15:1:2
            by: ~
```

###### Complex destructuring assignment

<!--pycg:classes/tuple_assignment-->

```js
class MyClass {
    func1() {
        /* Empty */
    }

    func2() {
        /* Empty */
    }
}

class MyClass2 {
    func3() {
        /* Empty */
    }
}

const {a, b} = {a: new MyClass(), b: new MyClass2()}

const [c, [d, e]] = [a.func1, [a.func2, b.func3]];

c();
d();
e();
```

```yaml
  relation:
      type: call
      extra: false
      items:
          -   from: file:'<File file0.js>'
              to: class:'MyClass'
              loc: 17:24
          -   from: file:'<File file0.js>'
              to: class:'MyClass2'
              loc: 17:42
          -   from: file:'<File file0.js>'
              to: method:'func1'
              loc: 21:1:1
              by: variable:'c'
          -   from: file:'<File file0.js>'
              to: method:'func2'
              loc: 22:1:1
              by: variable:'d'
          -   from: file:'<File file0.js>'
              to: method:'func3'
              loc: 23:1:1
              by: variable:'e'
```

#### Semantic: Class member resolving order

##### Examples

###### Basic

<!--pycg:mro/basic-->

```js
class A {
    func() {
        /* Empty */
    }
}

class B extends A {
    /* Empty */
}

const b = new B();
b.func();
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: class:'B'
            loc: 11:15
        -   from: file:'<File file0.js>'
            to: method:'A.func'
            loc: 12:3
            by: ~
```

###### Default call to constructor

<!--pycg:mro/basic_init-->

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
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: method:'func'
            loc: 14:3
            by: ~
        -   from: file:'<File file0.js>'
            to: method:'A.constructor'
            loc: 13:15:1
            by: class:'B'
```

###### Implicit member declaration

<!--pycg:mro/self_assignment-->

```js
class B {
    funcB() {
        this.foo = this.func;
    }

    func() {
        /* Empty */
    }
}

class A extends B {
    funcA() {
        this.foo = this.func;
    }

    func() {
        /* Empty */
    }
}

const a = new A();
a.funcB();                      // this.foo = A.func
a.foo();

a.funcA();                      // this.foo = A.func
a.foo();
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: class:'A'
            loc: 21:15
        -   from: file:'<File file0.js>'
            to: method:'funcB'
            loc: 22:3
            by: ~
        -   from: file:'<File file0.js>'
            to: method:'A.func'
            loc: 23:3:3
            by: ~
        -   from: file:'<File file0.js>'
            to: method:'B.func'
            loc: 23:3:3
            by: ~
            negative: true
        -   from: file:'<File file0.js>'
            to: method:'funcA'
            loc: 25:3
            by: ~
        -   from: file:'<File file0.js>'
            to: method:'A.func'
            loc: 26:3:3
            by: ~
```

###### Super call

<!--pycg:mro/super_call-->

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
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: method:'C.constructor'
            loc: 19:15:1
        -   from: method:'C.constructor'
            to: method:'B.constructor'
            loc: 15:9:5
        -   from: method:'B.constructor'
            to: method:'A.constructor'
            loc: 9:9:5
```
