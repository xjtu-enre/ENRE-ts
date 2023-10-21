## Object Literal

In JavaScript, you can use object literals to create objects for the purpose of function invocation.

### Supported Patterns

```yaml
name: Advanced Object Literal
```

#### Semantic: Object Literal 

##### Examples

###### Add Key

<!-- dicts/add_key -->

```js
function func() {
    /* Empty */
}

const d = {};

d["b"] = func;
d["b"](); // func
```

```yaml
relation:
    items:
        -   from: file:'<File file0.js>'
            to: variable:'d'
            loc: 5:7:1
            type: set
            init: true
        -   from: file:'<File file0.js>'
            to: variable:'d'
            loc: 7:1:6
            type: set
        -   from: file:'<File file0.js>'
            to: function:'func'
            loc: 7:1:6
            type: call
            implicit: true
```

###### Assign

<!-- dicts/assign -->

```js
function func1() {
    /* Empty */
}

function func2(){
    /* Empty */
}

const d = {
    "a": func1,
};

d["a"] = func2;

d["a"](); // call func2
```

```yaml
relation:
    items:
        -   from: file:'<File file0.js>'
            to: variable:'d'
            loc: 5:7:1
            type: set
            init: true
        -   from: file:'<File file0.js>'
            to: variable:'d'
            loc: 7:1:6
            type: set
        -   from: file:'<File file0.js>'
            to: function:'func'
            loc: 7:1:6
            type: call
            implicit: true 
```

###### Call

<!-- dicts/call -->

```ts
function func1(){
    /* Empty */
}

function func2(): void {
    /* Empty */
}

const d = {
    "a": func1,
    "1": func2, // Use strings as keys to match
    "2": 3,    // 2: 3 is not a function, so it can't be called
};

d["a"]();
d["1"]();
```

```yaml
relation:
    items:
        -   from: file:'<File file0.ts>'
            to: variable:'d'
            loc: 9:7:1
            type: set
            init: true
        -   from: file:'<File file0.ts>'
            to: function:'func1'
            loc: 15:1:6
            type: call
            implicit: true
        -   from: file:'<File file0.ts>'
            to: function:'func2'
            loc: 16:1:6
            type: call
            implicit: true 
```

###### Ext key

<!-- dicts/ext_key -->

```ts
export const key = "a";  
```

```ts
import { key } from "./file0"; 

function func(){
    /* Empty */
}

const d:= {
    "a": func,
};

d[key](); 
```

```yaml
relation:
    items:
        -   from: file:'<File file0.ts>'
            to: variable:'key'
            loc: file0:1:7
            type: set
            init: true
        -   from: file:'<File file1.ts>'
            to: variable:'key'
            loc: file1:1:10
            type: import
        -   from: alias:'key'
            to: variable:'variable'
            loc: file1:1:10
            type: aliasof
        -   from: file:'<File file1.ts>'
            to: function:'func'
            loc: file1:11:1
            type: call
            implicit: true
```

###### Nested

<!-- dicts/nested -->

```ts
function func1(){
    /* Empty */
}

function func2() {
    /* Empty */
}

const d:  = {
    "a": {
        "b": func1,
    },
};

d["a"]["b"] = func2;
d["a"]["b"](); // func2
```

```yaml
relation:
    items:
        -   from: file:'<File file0.ts>'
            to: variable:'d'
            loc: 9:7:1
            type: set
            init: true
        -   from: file:'<File file0.ts>'
            to: variable:'d'
            loc: 15:1:11
            type: set
        -   from: file:'<File file0.ts>'
            to: function:'func1'
            loc: 16:1:11
            type: call
            implicit: true
```

###### Param + New key param

<!-- dicts/param, dicts/new_key_param -->

```ts
function func2(){
    /* Empty */
}

function func(key= 'a') {
    d[key] = func2;
}

const d = {};

func();
d['a'](); //func2
```

```yaml
relation:
    items:
        -   from: file:'<File file0.ts>'
            to: variable:'d'
            loc: 9:7:1
            type: set
            init: true
        -   from: file:'<File file0.ts>'
            to: function:'func.d'
            loc: 11:1:4
            type: call
            implicit: true
        -   from: file:'<File file0.ts>'
            to: function:'func2'
            loc: 12:1:6
            type: call
            implicit: true
```

###### Return assign

<!-- dicts/return_assign -->

```ts
function func2(): void {
    /* Empty */
}

function func1(){
    return func2;
}

const d = {
    "a": func1(),
};

d["a"](); // func2
```

```yaml
relation:
    items:
        -   from: file:'<File file0.ts>'
            to: variable: 'd'
            loc: 9:7:1
            type: set
            init: true
        -   from: file:'<File file0.ts>'
            to: function:'func1'
            loc: 13:1:6
            type: call
            implicit: true
        -   from: function:'func1'
            to: function:'func2'
            loc: 13:1:6
            type: call
            implicit: true         
```

###### Type Coercion

<!-- dicts/type_coercion -->

```ts
function func1(){
    /* Empty */
}

function func2(){
    /* Empty */
}

const d= {
    "1": func1,
    1: func2, // Using strings and numbers as keys
};

d[1](); // func2
```

```yaml
relation:
    items:
        -   from: file:'<File file0.ts>'
            to: variable: 'd'
            loc: 9:7:1
            type: set
            init: true
        -   from: file:'<File file0.ts>'
            to: function:'func2'
            loc: 14:1:4
            type: call
            implicit: true   
```