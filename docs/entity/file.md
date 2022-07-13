## Entity: File

A `File Entity` is mostly a JavaScript source file, and can also
be something relevant to the project.

### Supported Pattern

Files under given path with one of following extension names will
be considered as `File Entity`s:

| Extension Name | Comment                                     |
|:--------------:|---------------------------------------------|
|     `.js`      | Including `.test.js`                        |
|     `.mjs`     |                                             |
|     `.cjs`     |                                             |
|     `.ts`      | Including `.d.ts`                           |
|     `.jsx`     |                                             |
|     `.tsx`     |                                             |
|    `.json`     | Not only `package.json`, but any JSON files |
