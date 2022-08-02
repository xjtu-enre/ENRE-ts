# ENRE-ts

ENRE-ts is an entity relationship extractor for ECMAScript and
TypeScript.

## Entity Categories

### Node.js

| Entity Name                  | Definition                                                                                                                                               |
|------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Package](entity/package.md) | A `Package Entity` is a Node.js package, which usually contains a `package.json` file to indicate this, and its name can be used as an import specifier. |

### ECMAScript

| Entity Name                      | Definition                                                                                                     |
|----------------------------------|----------------------------------------------------------------------------------------------------------------|
| [File](entity/file.md)           | A `File Entity` is mostly a JavaScript source file, and can also be something relevant to the project.         |
| [Variable](entity/variable.md)   | A `Variable Entity` is a variable defined by keywords `let`/`const`/`var`.                                     |
| [Function](entity/function.md)   | A `Function Entity` is either a block of code defined with keyword `function` or an arrow function `() => {}`. |
| [Parameter](entity/parameter.md) | A `Parameter Entity` is a variable defined either as function's formal parameter or in a `catch` clause.       |
| [Class](entity/class.md)         | A `Class Entity` is a template of object containing properties and methods defined by keyword `class`.         |
| [Field](entity/field.md)         | A `Field Entity` is a public / private 'variable' defined inside a `Class Entity`.                             |
| [Method](entity/method.md)       | A `Method Entity` is a 'function' or function-like thing (getter / setter) defined inside a `Class Entity`.    |
| [Property](entity/property.md)   | A `Property Entity` can be many things, including a key-value pair in an object, or an enum constant.          |

### TypeScript

| Entity Name                                | Definition                                                                                                                   |
|--------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| [Namespace](entity/namespace.md)           | A `Namespace Entity` is a named container for types providing a hierarchical mechanism for organizing code and declarations. |
| [Type Alias](entity/type-alias.md)         | A `Type Alias Entity` is a convenient alias for a compound type.                                                             |
| [Enum](entity/enum.md)                     | An `Enum Entity` is a set of named constants for document intent, or create a set of distinct cases.                         |
| [Enum Member](entity/enum-member.md)       | An `Enum Member Entity` is a member defined inside an enum body.                                                             |
| [Interface](entity/interface.md)           | An `Interface Entity` is a name and parameterized representation of an object type and can be implemented by classes.        |
| [Type Parameter](entity/type-parameter.md) | A `Type Parameter Entity` is a placeholder for an actual type.                                                               |

### React etc.

| Entity Name                          | Definition                                                                                                                     |
|--------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| [JSX Element](entity/jsx-element.md) | A `JSX Element Entity` is a syntax extension which uses XML-like syntax that can be processed into standard ECMAScript object. |

## Relation Categories

### ECMAScript

| Relation Name                    | Definition                                                                                                                                                                                |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Import](relation/import.md)     | An `Import Relation` establishes a link between a `File Entity` and any other kinds of entity that the latter one is imported for use.                                                    |
| [Export](relation/export.md)     | An `Export Relation` establishes a link between a `Package Entity` or `File Entity` and any other kinds of entity that the latter one is exported so that other files can import and use. |
| [Call](relation/call.md)         | A `Call Relation` establishes a link between an upper entity and a `Function Entity` or `Method Entity` that the latter one is called within the former one's scope.                      |
| [Set](relation/set.md)           | TBD                                                                                                                                                                                       |
| [Use](relation/use.md)           | TBD                                                                                                                                                                                       |
| [Modify](relation/modify.md)     | TBD                                                                                                                                                                                       |
| [Extend](relation/extend.md)     | An `Extend Relation` establishes a link between `Class Entity`s and `Interface Entity`s that enables hierarchical reusing.                                                                |
| [Override](relation/override.md) | TBD                                                                                                                                                                                       |

### TypeScript

| Relation Name                      | Definition                                                                                                                         |
|------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| [Type](relation/type.md)           | TBD                                                                                                                                |
| [Implement](relation/implement.md) | An `Implement Relation` establishes a constraint (type checking) on `Class Entity` according to `Interface Entity`'s declarations. |
| [Overload](relation/overload.md)   | TBD                                                                                                                                |

## Scoping Element Categories

`Scoping Element`s are code elements that are not
functionality-contributing entities, but affect the scope where
entities be according to the scoping rule.

| Scoping Element Name                                        | Definition |
|-------------------------------------------------------------|------------|
| [Block](scoping-element/block.md)                           |            |
| [Control Flow](scoping-element/control-flow.md)             |            |
| [Class Static Block](scoping-element/class-static-block.md) |            |

## References

1. [ECMAScript Specification](https://tc39.es/ecma262/2022), 13th
   edition, (June) 2022
2. [TypeScript Specification](https://github.com/microsoft/TypeScript/blob/main/doc/spec-ARCHIVED.md)
   , Version 1.8, January 2016
3. [JSX Specification](https://facebook.github.io/jsx/#sec-intro)
   , March 2022
4. [Node.js Documentation](https://nodejs.org/dist/latest-v16.x/docs/api/)
   , v16.14.2 LTS, April 2021
