## Behaviour Difference

This section talks about differences in definitions
between `ENRE` and `Understand™`, and will also
cover `Understand™`'
s bugs and `ENRE`'s capabilities.

> `Understand™` will be shorten as `und` below.

### Entity

#### Entity: Variable

| Level | Description                                               | Maximum Reproducible `und` Version | `ENRE`'s Behaviour               |           Detail / Discussion           |
|:-----:|-----------------------------------------------------------|------------------------------------|----------------------------------|:---------------------------------------:|
|   ❌   | `und` loses the entity defined by the rest operator `...` | 6.1 (Build 1079)                   | ✅ `ENRE` can extract it normally | [🔗](entity/variable.md#und_loses_rest) |

#### Entity: Function

| Level | Description                                                                                | Maximum Reproducible `und` Version | `ENRE`'s Behaviour                                           |                   Detail / Discussion                    |
|:-----:|--------------------------------------------------------------------------------------------|------------------------------------|--------------------------------------------------------------|:--------------------------------------------------------:|
|  ⚠️   | `und` treats a variable initialized by unnamed function expression as an `Function Entity` | 6.1 (Build 1079)                   | ⚠️ `ENRE` separates them as individuals                      | [🔗](entity/function.md#und_unnamed_function_expression) |
|  ⚠️   | `und`'s code location starts after the keyword `async`                                     | 6.1 (Build 1079)                   | ⚠️ `ENRE` captures an `Function Entity` started from `async` |       [🔗](entity/function.md#und_async_function)        | 

#### Entity: Parameter

| Level | Description                                                                                            | Maximum Reproducible `und` Version | `ENRE`'s Behaviour                         |              Detail / Discussion              |
|:-----:|--------------------------------------------------------------------------------------------------------|------------------------------------|--------------------------------------------|:---------------------------------------------:|
|   ❌   | `und` is confused if function parameters are from destructuring                                        | 6.1 (Build 1079)                   | ✅ `ENRE` can handle it correctly           | [🔗](entity/parameter.md#und_confused_params) |
|   ❌   | `und` treats `catch` clause's parameter as `Variable Entity`, which against the description in the doc | 6.1 (Build 1079)                   | ✅ `ENRE` treats it as a `Parameter Entity` |   [🔗](entity/parameter.md#und_catch_param)   |
