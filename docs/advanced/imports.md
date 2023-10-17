## Imports
An Import Relation establishes a link between a File Entity and any other kinds of entity that the latter one is imported for use.
### Supported Patterns

```yaml
name: Advanced Imports
```

#### Semantic: Import

##### Examples

###### Chained Import
```js
function func1() {
    /*Empty*/
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
```js
// from_module.js
export function func1() {
    /*Empty*/
}

export function func2() {
    /*Empty*/
}

```
```js
// main.js
import * as fromModule from './from_module';

fromModule.func1();
fromModule.func2();
```
```yaml
relation:
  items:
    -   from: file:'<File file3.js>'
        to: file:'<File file4.js>'
        loc: file4:1:7
        type: import
    -   from: alias:'fromModule'
        to: file:'<File file4.js>'
        loc: file1:1:13
        type: aliasof
    -   from: file:'<File file4.js>'
        to: function:'file3.func1'
        loc: file4:3:1
        type: call
        implicit: false
    -   from: file:'<File file4.js>'
        to: function:'file3.func2'
        loc: file4:4:1
        type: call
        implicit: false    
```
###### Nested
```js
////./nested
export function func2() {
    /*Empty*/
}

```
```js
////./nested
export { func2 } from './file5';

export function func() {
    /*Empty*/
}
```
```js
import { func, func2 } from './nested/file6';

func();
func2();

```
```yaml
relation:
  items:
    -   from: file:'<File file6.js>'
        to: file:'<File file7.js>'
        loc: file7:1:7
        type: import
    -   from: file:'<File file7.js>'
        to: function:'file6.func'
        loc: file7:3:1
        type: call
        implicit: false
    -   from: file:'<File file7.js>'
        to: function:'file5.func2'
        loc: file7:4:1
        type: call
        implicit: false
```

###### Init Import
```js
////./nested
export { Smth } from './nested/file9';

```
```js
////./nested
export class Smth {
    func() {
        /*Empty*/
    }
}

```
```js
import { Smth } from './nested/file9';

const smth = new Smth();
smth.func();


```
```yaml
relation:
  items:
    -   from: file:'<File file9.js>'
        to: file:'<File file10.js>'
        loc: file10:1:7
        type: import
    -   from: file:'<File file10.js>'
        to: function:'file9.func'
        loc: file10:4:1
        type: call
        implicit: true
```
###### Parent Import
```js
////./nested
import { to_import } from './file12';

export function func() {
    /*Empty*/
}

```
```js
export function func() {
    /*Empty*/
}

```
```js
import { Smth } from './nested/file11';

export function func() {
    /*Empty*/
}

const smth = new Smth();
smth();
```
```yaml
relation:
  items:
    -   from: file:'<File file12.js>'
        to: file:'<File file11.js>'
        loc: file11:1:7
        type: import
    -   from: file:'<File file11.js>'
        to: file:'<File file13.js>'
        loc: file13:1:7
        type: import
    -   from: file:'<File file13.js>'
        to: function:'file12.func'
        loc: file13:8:1
        type: call
        implicit: true
```
###### Relative Import
```js
////./nested
export function func2() {
    /*Empty*/
}

```
```js
////./nested
import { func2 } from './file14';

export function func1() {
    func2();
}

```
```js
import { func1 } from './nested/file15';

func1();
```
```yaml
relation:
  items:
    -   from: file:'<File file14.js>'
        to: file:'<File file15.js>'
        loc: file15:1:7
        type: import
    -   from: file:'<File file15.js>'
        to: file:'<File file16.js>'
        loc: file16:1:7
        type: import
    -   from: function:'func1'
        to: function:'file15.func1'
        loc: file16:3:1
        type: call
        implicit: true
    -   from: function:'file15.func1'
        to: function:'file14.func12'
        loc: file15:4:5
        type: call
        implicit: true
```
###### Submodule Import
 ```js
 //file17
 ////./to_import
export { func } from './to_import/file18';

 ```
 ```js
 //file18
export function func() {
    /*Empty*/
}

 ```
 ```js
 ////./to_import 
import { func } from './to_import/file17';

function func() {
    /*Empty*/
}

 ```

 ```yaml
 relation:
  items:
    -   from: file:'<File file17.js>'
        to: file:'<File file19.js>'
        loc: file19:1:7
        type: import
 ```

 ###### Submodule Import As
 ```js
 //file20
 ////./to_import
export { func } from './to_import/file21';

 ```
 ```js
////./to_import 
export function func() {
    /*Empty*/
}

 ```
 ```js

import * as as_to_import from './to_import/file20';

function func() {
    /*Empty*/
}

 ```

 ```yaml
 relation:
  items:
    -   from: file:'<File file20.js>'
        to: file:'<File file22.js>'
        loc: file22:1:7
        type: import
    -   from: alias:'as_to_import'
        to: file:'<File file0.js>'
        loc: file22:1:13
        type: aliasof
 ```
###### Submodule Import From
 ```js
 ////./from_module
function func1(){
    /*Empty*/
}

function func2(){
    /*Empty*/
}

export {func1,func2};
 ```
 ```js
import { func1, func2 } from './from_module/file23';

func1();
func2();

 ```

 ```yaml
 relation:
  items:
    -   from: file:'<File file23.js>'
        to: file:'<File file24.js>'
        loc: file24:1:7
        type: import
    -   from: file:'<File file24.js>'
        to: function:'file23.func1'
        loc: file24:3:1
        type: call
        implicit: false
    -   from: file:'<File file24.js>'
        to: function:'file23.func2'
        loc: file24:4:1
        type: call
        implicit: false
 ```