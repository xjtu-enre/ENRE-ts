## Object Mechanism

The fundamental structure of JavaScript objects.

### Supported Patterns

```yaml
name: Implicit object mechanism
```

<!--pycg:dicts/update unsupported-->

#### Semantic: Callables

##### Examples

###### Function object

```js
function bar() {
    /* Empty */
}

function foo() {
    /* Empty */
}

foo.a = bar;

const {a} = foo;

a();
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file0.js>'
      to: function:'bar'
      loc: 13:1:1
```

#### Semantic: Object Literal

##### Examples

###### Add property

<!--pycg:dicts/add_key-->

```js
function func() {
    /* Empty */
}

const d = {};

d["b"] = func;
d["b"]();
d.b();
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file0.js>'
      to: function:'func'
      loc: 8:1:6
    - from: file:'<File file0.js>'
      to: function:'func'
      loc: 9:3:1
```

###### Assign

<!--pycg:dicts/assign-->
<!--pycg:dicts/call-->

```js
function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

const d = {
    a: func1,
};

d.a();

d.a = func2;

d.a();
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file0.js>'
      to: function:'func1'
      loc: 13:3:1
    - from: file:'<File file0.js>'
      to: function:'func2'
      loc: 13:3:1
      # Flow sensitivity
      negative: true
    - from: file:'<File file0.js>'
      to: function:'func1'
      loc: 17:3:1
      # Flow sensitivity
      negative: true
    - from: file:'<File file0.js>'
      to: function:'func2'
      loc: 17:3:1
```

###### Dynamic property

<!--pycg:dicts/ext_key-->

```js
export const prop = "a";  
```

```js
import {prop} from "./file0";

function func() {
    /* Empty */
}

const d = {
    a: func,
};

d[prop]();
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file1.js>'
      to: function:'func'
      loc: file1:11:1:7
```

###### Nested

<!--pycg:dicts/nested-->

```ts
function func1() {
  /* Empty */
}

function func2() {
  /* Empty */
}

const d = {
  a: {
    b: func1,
  },
};

d.a.b = func2;
d.a.b();
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file0.ts>'
      to: function:'func2'
      loc: 16:1:5
```

###### Param + New key param

<!--pycg:dicts/param-->
<!--pycg:dicts/new_key_param-->
<!--pycg:param_key-->

```js
function func2() {
    /* Empty */
}

function func(d, key = 'a') {
    d[key] = func2;
}

const d = {};

func(d);
d.a();
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file0.js>'
      to: function:'func2'
      loc: 12:1:3
```

###### Return assign

<!--pycg:dicts/return_assign-->

```js
function func2() {
    /* Empty */
}

function func1() {
    return func2;
}

const d = {
    a: func1(),
};

d.a();
```

```yaml
relation:
  type: call
  items:
    - from: file:'<File file0.ts>'
      to: function:'func1'
      loc: 10:8
    - from: file:'<File file0.js>'
      to: function:'func2'
      loc: 13:1:3
      implicit: true         
```

###### Type Coercion

<!--pycg:dicts/type_coercion-->

```js
function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

const d = {
    "1": func1,
    1: func2,           // Numeric key is firstly evaluated to string, thus override the previous line
};

d[1]();                 // func2
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file0.js>'
      to: function:'func2'
      loc: 14:1:4
```
