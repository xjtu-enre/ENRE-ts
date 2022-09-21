## Entity: Package

A `Package Entity` is a Node.js package, which usually contains
a `package.json` file to indicate this, and its name can be used
as an import specifier (not directly available in environments
other than `node.js`).

> Please note the difference between a ECMAScript `Module` and a
> Node.js `Package`. Both them can be imported, but a `Module`
> may only refer to a single ECMAScript source file (which is
> covered in `File Entity`); and a `Package` is more complicated
> since it can contain multiple directories and files,
> properties of a `Package` is defined in corresponding
> `package.json` file, and `Package` can be nested.

### Supported Patterns

```yaml
name: Package declaration
freeForm: true
```

#### Semantic: Single Package

Typically, every `node.js` project contains at least
one `package.json` file. With that file presents, a `node.js`
package is then defined. The directory structure can be described
as the following graph.

```text
PackageName
|-- node_modules (Should not be version controlled)
|-- src
|-- ...
`-- package.json
```

Properties in `package.json` define much useful information, such
as name, version, type(determines whether the module systems
should follow rules of Commonjs or ESModule), dependencies, and
etc..

##### How `package.json` affects the results

Some properties may have impact on the static analysis process,
which are listed below.

###### `name` field

`name` specifies the name of the package, which can be used in
import specifiers.

* Regular name

  Regular name can be composed by any alphabet characters,
  numbers, and may contain hyphens and underscores. E.g.: `foo`
  , `bar2`, `some-pacakge`.

* Scoped name

  Package name can be prefixed with the scope `@xxx/`, while
  installing packages with the same scope, they will be located
  under `node_modules/@xxx/`. E.g.: `@enre/core`, `@enre/cli`.

###### `type` field

`type` specifies the module format that `node.js` uses for all
`.js` files that have that package.json file as their nearest
parent.

###### `files` field

> Default: * (All files)

`files` specifies the entries to be included when the package is
installed as a dependency.

###### `main` field

> Default: `index.js` in the package's root folder

`main` specifies the entry point of the package, that is, the
file when the import specifier contains only the package name
being referenced.

###### `exports` field

`exports` is an alternative to the "main" that can support
defining sub-path exports and conditional exports while
encapsulating internal un-exported modules.

###### `imports` field

`imports` specifies mappings from shorted specifiers starting
with `#` to qualified import specifiers, this also allows
conditional imports.

###### `browser` field

This is equivalent to `main`, only to hint that the package is
meant to be used client-side, where some global objects (such
as `window`) are not available in `node.js` environment.

#### Semantic: Nested Package

Packages can be nested, which supports the concept of
[monorepo](https://en.wikipedia.org/wiki/Monorepo). That's saying
the **scope** of a package starts from the same directory
containing its `package.json`, and ends to all subdirectories
until another `package.json` is found, or reaching a directory
named `node_modules`, or reaching the end of the
sub-...-sub-directories. The directory structure can be described
as the following graph.

```text
ParentPackage
|-- ...
|-- packages
|   |-- ChildPackage_0
|   |   |-- ...
|   |   `-- package.json
|   |-- ChildPackage_1
|   |   |-- ...
|   |   `-- package.json
`-- package.json (Top-level package)
```

##### How nesting affects the results

Some properties may have impact on the static analysis process,
which are listed below.

###### `workspace` field

`workspace` specifies subpackages that form a monorepo which
enables `npm` to manage multiple packages from the local files
system from within a singular top-level, root package.

### Properties

| Name | Description | Type | Default |
| --- | --- | :---: | :---: |
