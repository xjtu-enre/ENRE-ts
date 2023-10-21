## Classes

Class describes the common properties and methods of the created object.

### Supported Patterns

```yaml
name: Advanced classes 
```

#### Semantic: Class

##### Examples

###### Call + Assigned call

<!-- classes/call, classes/assigned_call -->

A class is instantiated and we assign one of its functions to a variable and then call that variable.

```ts
class MyClass {
    function func() {
        /* Empty */
    }
}

const a = new MyClass();
const b = a.func();
b();
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.ts>'
            to: method:'Myclass.fuc'
            loc: 8:1:1
```

###### Assigned self call

<!-- classes/assigned_self_call -->

A class is instantiated and we call one of its functions. The function called assigns `self` to a variable and using that variable we call a different function contained in the class.

```ts
class MyClass {
    function func1() {
        /* Empty */
    }

    function func2() {
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
        -   from: file:'<File file0.ts>'
            to: method:'MyClass.func2'
            loc: 12:1:1
        -   from: method:'MyClass.func2'
            to: method:'MyClass.func1'
            loc: 12:3:5
```

###### Base Class Calls Child

<!-- classes/base_class_calls_child -->

```ts
class A {
    func(){
        this.child();
    }

    child() {
        /* Empty */
    }
}

class B extends A {
    constructor() {
        super();
        this.child = this.func2;
    }

    func2(){
       /* Empty */
    }
}

class C extends A {
    constructor() {
        super();
        this.child = this.func2;
    }

    func2(){
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
    items:
        -   from: class:'B'
            to: class:'A'
            loc: file2:13:17
            type: extend
        -   from: class:'C'
            to: class:'A'
            loc: file2:22:17
            type: extend
        -   from: m ethod:'B.func'
            to: method:'B.func2'
            loc: 34:1:6
            type: call
            implicit: true
        -   from: method:'C.func'
            to: method:'C.func2'
            loc: 36:1:6
            type: call
            implicit: true
```

###### Direct call

<!-- classes/direct_call -->

```js
class MyClass {
    func(){
        /* Empty */
    }
}

new MyClass().func();
```

```yaml
relation:
    type: call
    extra: false
    implicit: false
    items:
        -   from: file:'<File file0.js>'
            to: method:'Myclass.func'
            loc: 7:5:9 
```

###### Import method access

<!-- classes/imported_attr_access, classes/imported_call, classes/imported_call_without_init  -->

```ts
function func(){
    /* Empty */
}
export { func };
```

```ts
import * as Myfunction from './file0.ts'; 

Myfunction.func();
```

```yaml
relation:
    items:
        -   from: file:'<File file0.ts>'
            to: function:'func'
            loc: file4:4:1
            type: export
            kind: any
        -   from: file:'<File file1.ts>'
            to: file:'<File file0.ts>'
            loc: file1:1:7
            type: import
        -   from: alias：'Myfunction'
            to: file:<File file0.ts>
            loc: file1:1:7
            type: aliasof 
        -   from: file:'<File file1.js>'
            to: function:'Myfunction.func'
            loc: file1:3:1
            type: call
            implicit: false      
```

###### Object

<!-- classes/instance -->

```ts
class MyClass {
    constructor(){
        /* Empty */
    }

    func(){
        /* Empty */
    }
}

new MyClass().func();
```

```yaml
relation:
    type: call
    extra: false
    implicit: false
    items:
        -   from: file:'<File file0.js>'
            to: method:'Myclass.constructor'
            loc: file0:11:5
            new: true
        -   from: file:'<File file0.ts>'
            to: method:'Myclass.func'
            loc: file0:11:15 
```

###### Nested Call

<!-- classes/nested_call -->

```js
class MyClass {
  func() {
    function nested() {
      /* Empty */
    }

    nested();
  }
}

const a = new MyClass();
a.func();
```

```yaml
relation:
    type: call
    extra: false
    implicit: false
    items:
        -   from: file:'<File file0.js>'
            to: method:'Myclass.func'
            loc: 13:1:1
        -   from: method:'Myclass.func'
            to: method:'MyClass.func.nested'
            loc: 7:5:6
```

###### Nested Class Call

We initialize classes with self parameters in a nested manner. Js cannt do this.

```js

```
```yaml

```
###### Parameter Call

<!-- classes/parameter_call -->

```js
class MyClass {
  func3() {
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
    implicit: false
    items:
        -   from: file:'<File file0.js>'
            to: method:'Myclass.func1'
            loc: 15:1:1
        -   from: method:'Myclass.func1'
            to: method:'MyClass.func2'
            loc: 15:9:1
        -   from: method:'Myclass.func2'
            to: method:'MyClass.func3'
            loc: 15:9:1
```

###### Return Call

<!-- classes/return_call -->

 Call func2 from func1, and func1 is returned as a reference to func2. This would create an infinite loop if called.

```js
class MyClass {
    func2() {
    }

    func1() {
        return this.func2;
    }
}

const a = new MyClass();
const b = a.func1();
b();
```

```yaml
relation:
    type: call
    extra: false
    implicit: false
    items:
        -   from: file:'<File file0.js>'
            to: method:'Myclass.func1'
            loc: 12:1:1
        -   from: file:'<File file0.js>'
            to: method:'Myclass.func2'
            loc: 12:1:1
```

###### Return Call Direct

<!-- classes/return_call_direct -->

Use the bind method to bind func2 to the this context within func1.

```js
class MyClass {
    func2() {
    }

    func1() {
        return this.func2.bind(this);
    }
}

const a = new MyClass();
const b = a.func1();
b();
```

```yaml
relation:
    type: call
    extra: false
    implicit: false
    items:
        -   from: file:'<File file0.js>'
            to: method:'Myclass.func1'
            loc: 12:1:1
        -   from: file:'<File file0.js>'
            to: method:'Myclass.func2'
            loc: 12:1:1
```

###### Constructor

<!-- classes/self_assign, classes/self_assign_func -->

A class is assigned as a self item to a class. 

```js
class A {
    func() {   
    }
}

class B {
    constructor(a) {
        this.a = a;
    }

    func() {
        this.a.func();
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
    implicit: false
    items:
        -   from: method:'B.func'
            to: method:'A.func1'
            loc: 11:5:4
        -   from: file:'<File file0.js>'
            to: method:'B.constructor'
            loc: 28:1:1
        -   from: file:'<File file0.js>'
            to: method:'B.func'
            loc: 28:1:1
```

###### Self Call

<!-- classes/self_call -->

A function is called inside a class using self.
In JavaScript, the class syntax is used to define classes, and constructor functions are used to initialize instances. The methods are defined within the class using regular function syntax.

```js
class MyClass {
    constructor() {
        this.func1();
    }

    func1() {
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
    implicit: false
    items:
        -   from: file:'<File file0.js>'
            to: method:'Myclass.constructor'
            loc: 15:1:1
        -   from: file:'<File file0.js>'
            to: method:'Myclass.func2'
            loc: 15:1:1
        -   from: method:'Myclass.constructor'
            to: method:'Myclass.func1'
            loc: 3:9:10
        -   from: method:'Myclass.func2'
            to: method:'Myclass.func1'
            loc: 10:9:10
```

###### Method Call

<!-- classes/static_method_call -->

Use the static keyword within a class to define static methods, which can be called on the class itself.

```js
class MyClass {
    static func() {
    }
}

MyClass.func();
 ```

 ```yaml
 relation:
    type: call
    extra: false
    implicit: false
    items:
        -   from: file:'<File file0.js>'
            to: method:'Myclass.func'
            loc: 6:1:12
 ```

 ###### Prototype 

<!-- classes/super_class_return -->

 use arrow function to catch.

 ```js
 class A {
    func1() {
    }
}

class B extends A {
    func2() {
        return () => this.func1();
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
    implicit: false
    items:
        -   from: file:'<File file0.js>'
            to: method:'A.func'
            loc: 14:1:2
        -   from: file:'<File file0.js>'
            to: method:'B.func'
            loc: 14:1:2
 ```

 ###### Destructuring Assignment

 <!-- classes/touple_assignment -->

 ```js
 class MyClass {
    constructor() {
        /* Empty */
    }

    func1() {
        /* Empty */
    }

    func2() {
        /* Empty */
    }

    func3() {
        /* Empty */
    }
}

class MyClass2 {
    constructor() {
        /* Empty */
    }
}

const a = new MyClass();
const b = new MyClass2();

const c = a.func1;
const d = a.func2;
const e = a.func3;

c();
d();
e();
 ```

 ```yaml
  relation:
    type: call
    extra: false
    implicit: false
    items:
        -   from: file:'<File file0.js>'
            to: method:'MyClass.constructor'
            loc: 32:1:1
        -   from: file:'<File file0.js>'
            to: method:'MyClass2.constructor'
            loc: 33:1:1
        -   from: file:'<File file0.js>'
            to: method:'MyClass.func1'
            loc: 32:1:1
        -   from: file:'<File file0.js>'
            to: method:'MyClass.func2'
            loc: 33:1:1
        -   from: file:'<File file0.js>'
            to: method:'MyClass.func3'
            loc: 34:1:1
 ```