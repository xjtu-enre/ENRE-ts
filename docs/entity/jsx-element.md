## Entity: JSX Element

A `JSX Element Entity` is a syntax extension which uses XML-like
syntax that can be processed into standard ECMAScript object.

### Supported Patterns

```yaml
name: JSX element declaration
```

#### Syntax: JSX Element Definitions

```text
PrimaryExpression :
    ...
    JSXElement
    JSXFragment

JSXElement :
    JSXSelfClosingElement
    JSXOpeningElement [JSXChildren] JSXClosingElement

JSXSelfClosingElement :
    `<` JSXElementName [JSXAttributes] `/` `>`

JSXOpeningElement :
    `<` JSXElementName [JSXAttributes] `>`

JSXClosingElement :
    `<` `/` JSXElementName `>`

JSXFragment :
    `<` `>` [JSXChildren] `<` `/` `>`

JSXElementName :
    JSXIdentifier
    JSXNamespacedName
    JSXMemberExpression

JSXIdentifier :
    IdentifierStart
    JSXIdentifier IdentifierPart
    JSXIdentifier [no WhiteSpace or Comment here] `-`
    
JSXNamespacedName :
    JSXIdentifier `:` JSXIdentifier
    
JSXMemberExpression :
    JSXIdentifier `.` JSXIdentifier
    JSXMemberExpression `.` JSXIdentifier
```

##### Examples

###### JSX self-closing element

```jsx

```

#### Syntax: JSX Attribute Definitions

```text
JSXAttributes :
    JSXSpreadAttribute [JSXAttributes]
    JSXAttribute [JSXAttributes]

JSXSpreadAttribute :
    `{` `..`. AssignmentExpression `}`

JSXAttribute :
    JSXAttributeName [JSXAttributeInitializer]

JSXAttributeName :
    JSXIdentifier
    JSXNamespacedName

JSXAttributeInitializer :
    `=` JSXAttributeValue

JSXAttributeValue :
    `"` [JSXDoubleStringCharacters] `"`
    `'` [JSXSingleStringCharacters] `'`
    `{` AssignmentExpression `}`
    JSXElement
    JSXFragment

JSXDoubleStringCharacters ::
    JSXDoubleStringCharacter [JSXDoubleStringCharacters]

JSXDoubleStringCharacter ::
    JSXStringCharacter(but not ")

JSXSingleStringCharacters ::
    JSXSingleStringCharacter [JSXSingleStringCharacters]

JSXSingleStringCharacter ::
    JSXStringCharacter(but not ')
```

#### Syntax: JSX Children Declarations

```text
JSXChildren :
    JSXChild [JSXChildren]

JSXChild :
    JSXText
    JSXElement
    JSXFragment
    `{` JSXChildExpressionopt `}`

JSXText ::
    JSXTextCharacter [JSXText]

JSXTextCharacter ::
    JSXStringCharacter(but not one of { or < or > or })

JSXChildExpression :
    AssignmentExpression
    `...` AssignmentExpression
```

#### Syntax: JSX String Declarations

```text
JSXStringCharacter ::
    SourceCharacter(but not one of HTMLCharacterReference)

JSXString :
    JSXDoubleStringCharacters
    JSXSingleStringCharacters
    JSXText
```
