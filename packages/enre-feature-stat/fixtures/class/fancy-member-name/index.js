export default {
  dependencies: ['all-classes', 'all-class-members'],
  process: (clz, clzMember) => {
    let
      identifierName = 0,
      stringLiteralIdentifierName = 0,
      fancyStringLiteralName = 0,
      rawNumericLiteralName = 0,
      convertedNumericLiteralName = 0,
      computedValueName = 0,
      classOidContainingFancyMemberName = new Set();

    for (const member of clzMember) {
      if (member.memberType === 'Constructor') {
        identifierName += 1;
      } else if (['Identifier', 'PrivateIdentifier'].includes(member.memberNameNodeType)) {
        identifierName += 1;
      } else {
        classOidContainingFancyMemberName.add(member.classOid);

        if (member.memberNameNodeType === 'StringLiteral') {
          /**
           * To determine whether a string literal is a valid identifier,
           * we don't want to make things to complicated, a stackoverflow answer seems
           * pretty easy and straightforward.
           *
           * https://stackoverflow.com/a/74275036/13878671
           */
          try {
            // Remove the quotes from the raw code
            new Function(`let ${member.memberNameRawCode.slice(1, -1)}`);
            stringLiteralIdentifierName += 1;
          } catch {
            fancyStringLiteralName += 1;
          }
        } else if (member.memberNameNodeType === 'NumericLiteral') {
          if (member.memberName === member.memberNameRawCode) {
            rawNumericLiteralName += 1;
          } else {
            convertedNumericLiteralName += 1;
          }
        } else if (member.memberNameNodeType === 'ComputedPropertyName') {
          computedValueName += 1;
        }
      }
    }

    const
      allClassesCount = clz.allClasses.length,
      allClassMembersCount = clzMember.length,
      fancyNameCount =
        stringLiteralIdentifierName
        + fancyStringLiteralName
        + rawNumericLiteralName
        + convertedNumericLiteralName
        + computedValueName;

    return {
      'all-classes': allClassesCount,
      'class-with-fancy-member-name': classOidContainingFancyMemberName.size,
      'feature-usage-against-class': classOidContainingFancyMemberName.size / allClassesCount,

      'all-class-members': allClassMembersCount,
      'types': {
        'identifier': identifierName,
        'string-literal-identifier': stringLiteralIdentifierName,
        'fancy-string-literal': fancyStringLiteralName,
        'raw-numeric-literal': rawNumericLiteralName,
        'converted-numeric-literal': convertedNumericLiteralName,
        'computed-value': computedValueName,
      },
      'feature-usage-against-class-member': fancyNameCount / allClassMembersCount,
    };
  },
};
