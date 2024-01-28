# Tag Function

A tag can be applied before template literal.

In TypeScript, template literals may have three AST node
types: `NoSubstitutionTemplateLiteral`, `TemplateExpression`, `TaggedTemplateExpression`.

## Patterns

```js
// Normal template literal
`aaa`;
`aaa${b}ccc`;

// Multi-line template literal
`aaa
bbb`;

// `myTag` is a function that returns a new string
//vvv
myTag`That ${person} is a ${age}.`;
```

Fancy usages:

```js
console.log`Hello`; // [ 'Hello' ]
console.log.bind(1, 2)`Hello`; // 2 [ 'Hello' ]
new Function("console.log(arguments)")`Hello`; // [Arguments] { '0': [ 'Hello' ] }

function recursive(strings, ...values) {
    console.log(strings, values);
    return recursive;
}

recursive`Hello``World`;
// [ 'Hello' ] []
// [ 'World' ] []
```

## Metrics

* #Usage%(TemplateLiteral)
* Type{SameAsStringLiteral, MultiLineStringLiteral, Normal, Tagged, FancyTagged}
    * SameAsStringLiteral`@intent?`: The template literal is the same as a string
      literal (without any substitution).
    * MultiLineStringLiteral: The template literal is a multi-line string literal (without
      any substitution).
    * Normal: The template literal is a normal template literal.
    * Tagged: The template literal is a tagged template literal.
    * FancyTagged: The template literal is a tagged template literal with fancy usage.

## Tags

* corner-case
* implicit
