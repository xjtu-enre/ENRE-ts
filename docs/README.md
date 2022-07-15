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

| Entity Name                          | Definition                                                                                           |
|--------------------------------------|------------------------------------------------------------------------------------------------------|
| [Namespace](entity/namespace.md)     | TBD                                                                                                  |
| [Type](entity/type.md)               | TBD                                                                                                  |
| [Enum](entity/enum.md)               | An `Enum Entity` is a set of named constants for document intent, or create a set of distinct cases. |
| [Enum Member](entity/enum-member.md) | An `Enum Member Entity` is a member defined inside an enum body.                                     |
| [Interface](entity/interface.md)     | TBD                                                                                                  |
| [Type Parameter](entity/typep.md)    | TBD                                                                                                  |

## Relation Categories

### ECMAScript

| Relation Name                    | Definition |
|----------------------------------|------------|
| [Import](relation/import.md)     | TBD        |
| [Export](relation/export.md)     | TBD        |
| [Call](relation/call.md)         | TBD        |
| [Set](relation/set.md)           | TBD        |
| [Use](relation/use.md)           | TBD        |
| [Modify](relation/modify.md)     | TBD        |
| [Extend](relation/extend.md)     | TBD        |
| [Override](relation/override.md) | TBD        |

### TypeScript

| Relation Name                      | Definition |
|------------------------------------|------------|
| [Typed](relation/typed.md)         | TBD        |
| [Implement](relation/implement.md) | TBD        |

## References

1. [ECMAScript Specification](https://tc39.es/ecma262/2022), 13th
   edition, (June) 2022
2. [TypeScript Specification](https://github.com/microsoft/TypeScript/blob/main/doc/spec-ARCHIVED.md)
   , Version 1.8, January 2016
3. [Node.js Documentation](https://nodejs.org/dist/latest-v16.x/docs/api/)
   , v16.14.2 LTS, April 2021
