## Imports

An Import Relation establishes a link between a File Entity and any other kinds of entity that the latter one is imported for use.

### Supported Patterns

```yaml
name: Advanced Imports
```

#### Semantic: Import

##### Examples

###### Chained Import

<!-- imports/chained_import -->

```js
function func1() {
    /* Empty */
}
```

```js
import { func1 } from './file0';
function func2() {
    func1();
}
```

```js
import { func2 } from './file1';
func2();
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file2.js>'
      to: function:'func2'
      loc: file2:2:1
    - from: function:'func2'
      to: function:'func1'
      loc: file1:2:5
```

###### Import All + Import As +Import From

<!-- imports/import_all, imports/import_as, imports/import_from -->

```js
export function func1() {
    /* Empty */
}

export function func2() {
    /* Empty */
}
```

```js
import * as fromModule from './file0';

fromModule.func1();
fromModule.func2();
```

```yaml
relation:
  items:
    -   from: file:'<File file0.js>'
        to: file:'<File file1.js>'
        loc: file1:1:7
        type: import
    -   from: alias:'fromModule'
        to: file:'<File file1.js>'
        loc: file1:1:13
        type: aliasof
    -   from: file:'<File file1.js>'
        to: function:'file3.func1'
        loc: file1:3:1
        type: call
        implicit: false
    -   from: file:'<File file1.js>'
        to: function:'file0.func2'
        loc: file1:4:1
        type: call
        implicit: false    
```

###### Nested

```js
////./nested
export function func2() {
    /* Empty */
}

```

```js
////./nested
export { func2 } from './file0';

export function func() {
    /* Empty */
}
```

```js
import { func, func2 } from './nested/file1';

func();
func2();

```

```yaml
relation:
  items:
    -   from: file:'<File file1.js>'
        to: file:'<File file2.js>'
        loc: file2:1:7
        type: import
    -   from: file:'<File file2.js>'
        to: function:'file1.func'
        loc: file2:3:1
        type: call
        implicit: false
    -   from: file:'<File file2.js>'
        to: function:'file0.func2'
        loc: file2:4:1
        type: call
        implicit: false
```

###### Init Import

<!-- imports/init_import, imports/init_func_import -->

```js
////./nested
export { Smth } from './nested/file1';
```

```js
////./nested
export class Smth {
    func() {
        /* Empty */
    }
}
```

```js
import { Smth } from './nested/file1';

const smth = new Smth();
smth.func();
```

```yaml
relation:
  items:
    -   from: file:'<File file1.js>'
        to: file:'<File file2.js>'
        loc: file2:1:7
        type: import
    -   from: file:'<File file2.js>'
        to: function:'file1.func'
        loc: file10:4:1
        type: call
        implicit: true
```

###### Parent Import

<!-- imports/parent_import -->

```js
////./nested
import { func } from './file1';

export function func() {
    /* Empty */
}
```

```js
export function func() {
    /* Empty */
}
```

```js
import { Smth } from './nested/file1';

export function func() {
    /* Empty */
}

const smth = new Smth();
smth();
```

```yaml
relation:
  items:
    -   from: file:'<File file1.js>'
        to: file:'<File file0.js>'
        loc: file0:1:7
        type: import
    -   from: file:'<File file1.js>'
        to: file:'<File file2.js>'
        loc: file2:1:7
        type: import
    -   from: file:'<File file2.js>'
        to: function:'file0.func'
        loc: file2:8:1
        type: call
        implicit: true
```

###### Relative Import

<!-- imports/relative_import, imports/relative_import_with_name -->

```js
////./nested
export function func2() {
    /* Empty */
}

```

```js
////./nested
import { func2 } from './file0';

export function func1() {
    func2();
}

```

```js
import { func1 } from './nested/file1';

func1();
```

```yaml
relation:
  items:
    -   from: file:'<File file0.js>'
        to: file:'<File file1.js>'
        loc: file1:1:7
        type: import
    -   from: file:'<File file1.js>'
        to: file:'<File file2.js>'
        loc: file2:1:7
        type: import
    -   from: function:'func1'
        to: function:'file1.func1'
        loc: file2:3:1
        type: call
        implicit: true
    -   from: function:'file1.func1'
        to: function:'file0.func2'
        loc: file1:4:5
        type: call
        implicit: true
```

###### Submodule Import

<!-- imports/submodule_import -->

 ```js
 ////./ToImport
export { func } from './ToImport/file18';

 ```
 
 ```js
export function func() {
    /* Empty */
}
 ```

 ```js
 ////./ToImport 
import { func } from './ToImport/file0';

function func() {
    /* Empty */
}
 ```

 ```yaml
 relation:
  items:
    -   from: file:'<File file0.js>'
        to: file:'<File file2.js>'
        loc: file2:2:7
        type: import
 ```

 ###### Submodule Import As

 <!-- imports/submodule_import_as -->

 ```js
 ////./ToImport
export { func } from './ToImport/file1';

 ```
 ```js
////./ToImport 
export function func() {
    /* Empty */
}
 ```

 ```js
import * as as_to_import from './ToImport/file0';

function func() {
    /* Empty */
}
 ```

 ```yaml
 relation:
  items:
    -   from: file:'<File file0.js>'
        to: file:'<File file2.js>'
        loc: file2:1:7
        type: import
    -   from: alias:'as_to_import'
        to: file:'<File file0.js>'
        loc: file2:1:13
        type: aliasof
 ```

###### Submodule Import From

<!-- imports/submodule_import_from -->

 ```js
 ////./from_module
function func1(){
    /* Empty */
}

function func2(){
    /* Empty */
}

export {func1,func2};
 ```

 ```js
import { func1, func2 } from './from_module/file0';

func1();
func2();
 ```

 ```yaml
 relation:
  items:
    -   from: file:'<File file0.js>'
        to: file:'<File file1.js>'
        loc: file1:1:7
        type: import
    -   from: file:'<File file1.js>'
        to: function:'file0.func1'
        loc: file1:3:1
        type: call
        implicit: false
    -   from: file:'<File file1.js>'
        to: function:'file0.func2'
        loc: file1:4:1
        type: call
        implicit: false
 ```