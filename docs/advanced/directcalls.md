## Direct Calls

Functions establish a link between an upper entity and any other entities which are callable that the latter one is called within the former one's scope.

### Supported Patterns

```yaml
name: Advanced Direct Calls
```

#### Semantic: Direct calls

##### Examples

###### Assigned Call

<!-- direct_calls/assigned_call -->

```ts
function ReturnFunc {
    /* Empty */
}

function func(){
    const a= ReturnFunc;
    return a;
}

const a= func;
a()(); 
```

```yaml
relation:
    items:
        -   from: file:'<File file0.ts>'
            to: variable:'a'
            loc: 10:7:1
            type: set
            init: true
        -   from: file:'<File file0.ts>'
            to: function:'func'
            loc: 11:1:1
            type: call
            implicit: true
        -   from: function:'func'
            to: function:'ReturnFunc'
            loc: 6:12:1
            type: call
            implicit: true
```

###### Return call

<!-- direct_calls/return_call -->

```ts
function ReturnFunc(){
    function NestedReturnFunc(){
        /* Empty */
    }
    return NestedReturnFunc;
}

function func() {
    return ReturnFunc;
}

func()(); 
func()()(); 
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.ts>'
            to: function:'func.ReturnFunc'
            loc: 12:1:4
            type: call
            implicit: true
        -   from: function:'func'
            to: function:'func.ReturnFunc.NestedReturnFunc'
            loc: 12:1:4
            type: call
            implicit: true
```

###### Imported return call

<!-- direct_calls/imported_return_call -->

```ts
function ReturnFunc(){
  /* Empty */
}

function func() {
  return ReturnFunc;
}

export { func };

```

```ts
import { func } from './file0';

func()();
```

```yaml
relation:
    items:
        -   from: file:'<File file0.ts>'
            to: function:'func'
            loc: file0:9:1
            type: export
            kind: any
        -   from: file:'<File file1.ts>'
            to: function:'func'
            loc: file1:1:6
            type: import
        -   from: file:'<File file1.ts>'
            to: function:'func.ReturnFunc'
            loc: file1:3:4
            type: call
            implicit: true
```

##### With parameters

<!-- direct_calls/with_parameters -->

```ts
function func(){
    /* Empty */
}

function func2(a){
    return a;
}

function func3(){
    return func2;
}

func3()(func)(); 
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.ts>'
            to: function:'func3'
            loc: 13:1:4
        -   from: function:'func3'
            to: function:'func2'
            loc: 10:12:5
        -   from: function:'func2'
            to: function:'func'
            loc: 6:12:1
```
