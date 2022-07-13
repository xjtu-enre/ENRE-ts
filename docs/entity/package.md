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

### Supported Pattern

#### Single Package

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

The difference of some properties may have impact on the static
analysis process, which is listed below.

[TODO]

#### Nested Package

Packages can be nested, which supports the concept of
[Monorepo](https://en.wikipedia.org/wiki/Monorepo). That's saying
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
```

##### How nesting affects the results

As [`node.js`'s]
