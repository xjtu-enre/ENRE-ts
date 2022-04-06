## Behavior Differences

This section lists all differences in definitions between `ENRE`
and `Understand™`, and will also cover `Understand™`'s bugs
and `ENRE`'s capabilities associated within those.

> `Understand™` will be shorten as `und` below and other places.

| `und`'s latest version | Release date |
|:----------------------:|:------------:|
|    6.1 (Build 1096)    |   2022/2/4   |

### Entity

#### Entity: Variable

| Level | Description                                                                                 | Maximum Reproducible `und` Version | `ENRE`'s Behavior                |           Detail / Discussion           |
|:-----:|---------------------------------------------------------------------------------------------|:----------------------------------:|----------------------------------|:---------------------------------------:|
|   ❌   | `und` loses the entity defined by the rest operator `...` in an array destructuring pattern |              (latest)              | ✅ `ENRE` can extract it normally | [🔗](entity/variable.md#und_loses_rest) |

#### Entity: Function

| Level | Description                                                                               | Maximum Reproducible `und` Version | `ENRE`'s Behavior                                            |                   Detail / Discussion                    |
|:-----:|-------------------------------------------------------------------------------------------|:----------------------------------:|--------------------------------------------------------------|:--------------------------------------------------------:|
|  ⚠️   | `und` treats a variable initialized by unnamed function expression as a `Function Entity` |              (latest)              | ⚠️ `ENRE` separates them as individuals                      | [🔗](entity/function.md#und_unnamed_function_expression) |
|  ⚠️   | `und`'s code location starts after the keyword `async`                                    |              (latest)              | ⚠️ `ENRE` captures an `Function Entity` started from `async` |       [🔗](entity/function.md#und_async_function)        | 

#### Entity: Parameter

| Level | Description                                                                                              | Maximum Reproducible `und` Version | `ENRE`'s Behavior                          |              Detail / Discussion              |
|:-----:|----------------------------------------------------------------------------------------------------------|:----------------------------------:|--------------------------------------------|:---------------------------------------------:|
|   ❌   | `und` is messed up if function parameters are defined using destructuring pattern                        |              (latest)              | ✅ `ENRE` can handle this correctly         | [🔗](entity/parameter.md#und_confused_params) |
|   ❌   | `und` treats `catch` clause's parameter as a `Variable Entity`, which against the description in the doc |              (latest)              | ✅ `ENRE` treats it as a `Parameter Entity` |   [🔗](entity/parameter.md#und_catch_param)   |

#### Entity: Class

| Level | Description                                                                                                                     | Maximum Reproducible `und` Version | `ENRE`'s Behaviour                                                                                                           |            Detail / Discussion             |
|:-----:|---------------------------------------------------------------------------------------------------------------------------------|:----------------------------------:|------------------------------------------------------------------------------------------------------------------------------|:------------------------------------------:|
|   ✅   | `und` separates a variable initialized by unnamed class expression as `Variable Entity` and `Class Entity` (with the same name) |              (latest)              | ✅ `ENRE` behaves identical to `und`, just to prove `und` has unmatched behaviors across `Function Entity` and `Class Entity` | [🔗](entity/class.md#und_class_expression) |
|   ❌   | `und` reports a parse error when encountering a `StaticBlock`                                                                   |              (latest)              | ✅ `ENRE` can handle this correctly (by creating a new scope)                                                                 |   [🔗](entity/class.md#und_static_block)   |

#### Entity: Field

| Level | Description                                                                              | Maximum Reproducible `und` Version | `ENRE`'s Behaviour                                                               |           Detail / Discussion           |
|:-----:|------------------------------------------------------------------------------------------|:----------------------------------:|----------------------------------------------------------------------------------|:---------------------------------------:|
|  ⚠️   |  `und` chooses to treat a class property as `Property Entity`                            |              (latest)              | ⚠️ `ENRE` renames `Property Entity` as `Field Entity` to match the specification |   [🔗](entity/field.md#und_property)    |
|   ❌   | `und` reports a parse error if `StringLiteral` / `NumericLiteral` shows up as a field    |              (latest)              | ✅ `ENRE` can handle this correctly                                               |  [🔗](entity/field.md#und_class_field)  |
|   ❌   | `und` ignores a filed declared by `ComputedPropertyName`                                 |              (latest)              | ❌ `ENRE` can not extract this too for now                                        |  [🔗](entity/field.md#und_class_field)  |
|   ❌   | `und` wrongly report a `private filed` as a `public property`, which should be `private` |              (latest)              | ✅ `ENRE` can handle this correctly                                               | [🔗](entity/field.md#und_private_field) |
