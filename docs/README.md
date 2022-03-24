# ENRE.js

ENRE.js is an entity relationship extractor for ECMAScript and
TypeScript.

## Entity Categories

### ECMAScript

| Entity Name                      | Definition                                                                                                     |
|----------------------------------|----------------------------------------------------------------------------------------------------------------|
| [Module](entity/module.md)       | TBD                                                                                                            |
| [File](entity/file.md)           | TBD                                                                                                            |
| [Variable](entity/variable.md)   | A `Variable Entity` is a variable defined by keywords `let`/`const`/`var`.                                     |
| [Function](entity/function.md)   | A `Function Entity` is either a block of code defined with keyword `function` or an arrow function `() => {}`. |
| [Parameter](entity/parameter.md) | A `Parameter Entity` is a variable defined either as function's formal parameter or in a `catch` clause.       |
| [Class](entity/class.md)         | A `Class Entity` is a template of object containing variables and functions defined by keyword `class`.        |
| [Method](entity/method.md)       | TBD                                                                                                            |

### TypeScript

| Entity Name                      | Definition |
|----------------------------------|------------|
| [Namespace](entity/namespace.md) | TBD        |
| [type](entity/type.md)           | TBD        |
| [enum](entity/enum.md)           | TBD        |
| [interface](entity/interface.md) | TBD        |

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

## Reference

1. [ECMAScript Specification](https://tc39.es/ecma262), 12th
   edition, June 2021
