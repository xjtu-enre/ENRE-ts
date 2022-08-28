## Entity: File

A `File Entity` is mostly a JavaScript source file, and can also
be something relevant to the project.

### Supported Patterns

```yaml
name: File extensions
```

Files under given path with one of following extension names will
be considered as `File Entity`s:

| Extension Name | Comment                                                             |
|:--------------:|---------------------------------------------------------------------|
|     `.js`      | Including `.test.js`                                                |
|     `.mjs`     |                                                                     |
|     `.cjs`     |                                                                     |
|     `.ts`      | Including `.d.ts`                                                   |
|    `.mts`*     |                                                                     |
|    `.cts`*     |                                                                     |
|     `.jsx`     |                                                                     |
|     `.tsx`     |                                                                     |
|    `.json`     | `package.json` and `tsconfig.json` may modify behaviors of analysis |

* `.mts` and `.cts` are new in TypeScript 4.7, continue
  reading [this release note](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#new-file-extensions)
  to learn more.

#### Semantic: `.js` extension

##### Examples

###### `.js` extension

```js
/* Empty */
```

```yaml
name: js extension
entity:
    type: file
    items:
        -   name: file0.js
            loc: file0
```

#### Semantic: `.mjs` extension

##### Examples

###### `.mjs` extension

```js
//// @ext mjs
/* Empty */
```

```yaml
name: mjs extension
entity:
    type: file
    items:
        -   name: file0.mjs
            loc: file0
```

#### Semantic: `.cjs` extension

##### Examples

###### `.cjs` extension

```js
//// @ext cjs
/* Empty */
```

```yaml
name: cjs extension
entity:
    type: file
    items:
        -   name: file0.cjs
            loc: file0
```

#### Semantic: `.ts` extension

##### Examples

###### `.ts` extension

```ts
/* Empty */
```

```yaml
name: ts extension
entity:
    type: file
    items:
        -   name: file0.ts
            loc: file0
```

#### Semantic: `.mts` extension

##### Examples

###### `.mts` extension

```js
//// @ext mts
/* Empty */
```

```yaml
name: mts extension
entity:
    type: file
    items:
        -   name: file0.mts
            loc: file0
```

#### Semantic: `.cts` extension

##### Examples

###### `.cts` extension

```js
//// @ext cts
/* Empty */
```

```yaml
name: cts extension
entity:
    type: file
    items:
        -   name: file0.cts
            loc: file0
```

#### Semantic: `.jsx` extension

##### Examples

###### `.jsx` extension

```jsx
/* Empty */
```

```yaml
name: jsx extension
entity:
    type: file
    items:
        -   name: file0.jsx
            loc: file0
```

#### Semantic: `.tsx` extension

##### Examples

###### `.tsx` extension

```tsx
/* Empty */
```

```yaml
name: tsx extension
entity:
    type: file
    items:
        -   name: file0.tsx
            loc: file0
```

#### Semantic: `.json` extension

##### Examples

###### General JSON file

```json
//// any.json
{}
```

```yaml
name: json extension
entity:
    type: file
    items:
        -   name: any.json
            loc: file0
```

###### `package.json`

For how a `package.json` affects the analysis result, continue
reading [docs/entity/package.md](./package.md) to learn more.

```json
//// package.json
{}
```

```yaml
name: package.json
entity:
    type: file
    items:
        -   name: package.json
            loc: file0
```

###### `tsconfig.json`

```json
//// tsconfig.json
{}
```

```yaml
name: tsconfig.json
entity:
    type: file
    items:
        -   name: tsconfig.json
            loc: file0
```
