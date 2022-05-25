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

### TypeScript

| Entity Name                      | Definition |
|----------------------------------|------------|
| [Namespace](entity/namespace.md) | TBD        |
| [Type](entity/type.md)           | TBD        |
| [Enum](entity/enum.md)           | TBD        |
| [Interface](entity/interface.md) | TBD        |

## Relation Categories

### ECMAScript

| Relation Name                    | Definition |
|----------------------------------|------------|
| [Import](relation/import.md)     | TBD        |
| [Export](relation/export.md)     | TBD        |
| [Call](relation/call.md)         | TBD        |
| [Set](relation/set.md)           | TBD        |
| [Use](relation/use.md)           | TBD        |
| [Extend](relation/extend.md)     | TBD        |
| [Override](relation/override.md) | TBD        |

### TypeScript

| Relation Name            | Definition |
|--------------------------|------------|
| [Type](relation/type.md) | TBD        |

## References

1. [ECMAScript Specification](https://tc39.es/ecma262/2022), 13th
   edition, (June) 2022
2. [Node.js Documentation](https://nodejs.org/dist/latest-v16.x/docs/api/)
   , v16.14.2 LTS, April 2021
