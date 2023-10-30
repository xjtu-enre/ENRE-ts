## Returns

Function returns other JS elements that can be further invoked.

### Supported Patterns

```yaml
name: Implicit Returns
```

<!--pycg:returns/return_complex unnecessary-->

#### Semantic: Returns

##### Examples

###### Call returned function

<!--pycg:returns/call-->
<!--pycg:returns/imported_call-->
<!--pycg:returns/nested_import_call-->

```js
export function returnFunc() {
    /* Empty */
}
```

```js
import {returnFunc} from 'file0.js'

export function func() {
    return returnFunc;
}
```

```js
import {func} from 'file1.js';

const a = func();
a();
```

```yaml
relation:
  type: call
  items:
    - from: file:'<File file0.js>'
      to: function:'func'
      loc: file1:3:11
    - from: file:'<File file0.js>'
      to: function:'returnFunc'
      loc: file1:4:1:1
      implicit: true
```
