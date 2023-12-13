## Notice

The `@enre-ts/naming` package has been refactored to leverage simplified format.

**BEFORE:**

```
foo // Normal and valid identifier
<File base="foo" ext="ts">
<Anonymous as="Function">
<Modified raw="a-not-valid-identifier" as="StringLiteral">
```

**AFTER:**

```
foo // Not changed
<File foo.ts>
<Anon Function>
<Str a-not-valid-identifier>
```

(For details see `src/name.ts`)

## Migration

Below are step-by-step guides to help downstream users to migrate to the new format.

### Apply new string format in docs

Below are regex matcher and replacer that convert strings matched to the former pattern to
the latter.

1. Update all `File` name

   `<File base="(.+)" ext="(.+)">`  
   `<File $1.$2>`

2. Update all `Anonymous` name

   `<Anonymous as="(.+)">`  
   `<Anon $1>`

3. Update all `Modified` name

    * `<Modified raw="(.+)" as="StringLiteral">`  
      `<Str $1>`

    * `<Modified raw="(.+)" as="NumericLiteral" value=".+">`  
      `<Num $1>`

    * `<Modified raw="(.+)" as="PrivateIdentifier">`  
      `<Pvt $1>`

### Apply new object creation format in code

**BEFORE:**

```ts
import {buildENREName, ENRENameAnonymous} from '@enre-ts/naming';

buildENREName('some name');                         // Normal valid identifier
buildENREName<ENRENameAnonymous>({as: 'Class'});    // Anonymous class
```

**AFTER:**

```ts
import ENREName from '@enre-ts/naming';

new ENREName('Norm', 'some name');                  // Normal valid identifier
new ENREName('Anon', 'Class');                      // Anonymous class
```
