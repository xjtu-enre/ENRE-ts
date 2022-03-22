## Behaviour Difference

This section talks about differences in definitions between `ENRE` and `Understand™`, and will also cover `Understand™`'
s bugs and `ENRE`'s capabilities.

> `Understand™` will be shorten as `und` below.

### Entity

#### Entity: Variable

| Level | Description                                               | Maximum Reproducible `und` Version | `ENRE`'s Behaviour               |           Detail / Discussion           |
|:-----:|-----------------------------------------------------------|------------------------------------|----------------------------------|:---------------------------------------:|
|   ❌   | `und` loses the entity defined by the rest operator `...` | 6.1 (Build 1079)                   | ✅ `ENRE` can extract it normally | [🔗](entity/variable.md#und_loses_rest) |

#### Entity: Function

| Level | Description                                                                            | Maximum Reproducible `und` Version | `ENRE`'s Behaviour                                                |                   Detail / Discussion                    |
|:-----:|----------------------------------------------------------------------------------------|------------------------------------|-------------------------------------------------------------------|:--------------------------------------------------------:|
|  ⚠️   | `und` treats a variable inited by unnamed function expression as an `Entity: Function` | 6.1 (Build 1079)                   | ⚠️ `ENRE` separates them as individuals                           | [🔗](entity/function.md#und_unnamed_function_expression) |
|  ⚠️   | `und`'s code location starts after the keyword `async`                                 | 6.1 (Build 1079)                   | ⚠️ `ENRE` will capture an `Entity: Function` started from `async` |       [🔗](entity/function.md#und_async_function)        | 
