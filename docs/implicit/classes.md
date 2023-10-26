## Classes

Various explicit and implicit class member usages.

### Supported Patterns

```yaml
name: Implicit Class Calls 
```

<!--pycg:classes/direct_call explicit-->
<!--pycg:classes/imported_attr_access explicit-->
<!--pycg:classes/imported_call explicit-->
<!--pycg:classes/imported_call_without_init explicit-->
<!--pycg:classes/instance explicit-->

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
  implicit: true
  items:
    - from: file:'<File file0.js>'
      to: method:'func'
      loc: 8:3
    - from: file:'<File file0.js>'
      to: method:'func'
      loc: 11:1:1
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
  implicit: true
  items:
    - from: file:'<File file0.js>'
      to: method:'func2'
      loc: 13:3
    - from: method:'func2'
      to: method:'func1'
      loc: 8:11
```

###### Access sibling method through `this` 2

`this` in JavaScript does not follow the syntactic scope, but rather the runtime scope, (`this` is bound to
corresponding `this` where it is invoked, not where it is defined). In this case, a new variable `b` points
to `func2`, and when `b` is finally invoked, `this` is bound to the global `this`, which is `undefined`, and the
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

const b = a.func2;
b();                    // JSError: undefined is not an object (evaluating 'a.func1')
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file0.js>'
      to: method:'func2'
      loc: 13:1:1
    - from: method:'func2'
      to: method:'func1'
      loc: 8:11
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
  implicit: true
  items:
    - from: method:'func'
      to: method:'B.func2'
      loc: 3:14:5
    - from: method:'func'
      to: method:'C.func2'
      loc: 3:14:5
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

const a = new MyClass();
a.func();
```

```yaml
relation:
  type: call
  implicit: false
  items:
    - from: file:'<File file0.js>'
      to: method:'func'
      loc: 18:3
    - from: method:'func'
      to: method:'nested0'
      loc: 7:9
    - from: method:'func'
      to: method:'nested1'
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
  items:
    - from: file:'<File file0.js>'
      to: method:'A.func'
      loc: 29:3
    - from: method:'A.func'
      to: method:'B.func'
      loc: 24:11
    - from: method:'B.func'
      to: method:'C.func'
      loc: 13:16
      implicit: true
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
  items:
    - from: file:'<File file0.js>'
      to: method:'func1'
      loc: 16:3
    - from: method:'func1'
      to: method:'func2'
      loc: 11:9:1
      implicit: true
    - from: method:'func2'
      to: method:'func3'
      loc: 7:9:1
      implicit: true
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
  items:
    - from: file:'<File file0.js>'
      to: method:'func1'
      loc: 12:13
    - from: file:'<File file0.js>'
      to: method:'func2'
      loc: 13:1:1
      implicit: true
    - from: file:'<File file0.js>'
      to: method:'func2'
      loc: 15:1:9
      implicit: true
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
  implicit: true
  items:
    - from: method:'B.func'
      to: method:'A.func'
      loc: 14:16
    - from: method:'B.func'
      to: method:'B.func2'
      loc: 15:14
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
  items:
    - from: method:'constructor'
      to: method:'func1'
      loc: 8:14:4
      negative: true
    - from: method:'constructor'
      to: method:'A.func2'
      loc: 11:14:4
      negative: true
    - from: method:'constructor'
      to: method:'func2'[@loc=1]
      loc: 11:14:4
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
  implicit: false
  items:
    - from: file:'<File file0.js>'
      to: method:'constructor'
      loc: 15:15:7
    - from: file:'<File file0.js>'
      to: method:'func2'
      loc: 16:3
    - from: method:'constructor'
      to: method:'func1'
      loc: 3:14
    - from: method:'func2'
      to: method:'func1'
      loc: 11:14
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
   implicit: false
   items:
     - from: file:'<File file0.js>'
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
   implicit: false
   items:
     - from: file:'<File file0.js>'
       to: method:'A.func1'
       loc: 15:1:2
     - from: file:'<File file0.js>'
       to: method:'B.func2'
       loc: 14:14
```

###### Complex destructuring assignment

 <!--pycg:classes/touple_assignment-->

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
    implicit: true
    items:
      - from: file:'<File file0.js>'
        to: method:'func1'
        loc: 21:1:1
      - from: file:'<File file0.js>'
        to: method:'func2'
        loc: 22:1:1
      - from: file:'<File file0.js>'
        to: method:'func3'
        loc: 23:1:1
```
