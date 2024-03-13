export default {
  dependencies: ['template-literal-usages'],
  process: (usages) => {
    let
      sameAsStringLiteral = 0,
      multiLineStringLiteral = 0,
      normal = 0,
      tagged = 0,
      fancyTagged = 0,
      // Calculate node type frequency
      fancyTaggedNodeTypes = {};

    for (const usage of usages) {
      switch (usage.templateLiteralType) {
        case 'SameAsStringLiteral':
          sameAsStringLiteral += 1;
          break;

        case 'MultiLineStringLiteral':
          multiLineStringLiteral += 1;
          break;

        case 'Normal':
          normal += 1;
          break;

        case 'Tagged':
          tagged += 1;
          break;

        case 'FancyTagged':
          fancyTagged += 1;

          if (fancyTaggedNodeTypes[usage.taggedTagNodeType] === undefined) {
            fancyTaggedNodeTypes[usage.taggedTagNodeType] = 0;
          }

          fancyTaggedNodeTypes[usage.taggedTagNodeType] += 1;
          break;
      }
    }

    const
      tlCount = usages.length,
      taggedCount = tagged + fancyTagged;

    return {
      'all-template-literals': tlCount,
      'tagged-template-literals': taggedCount,
      'feature-usage-against-template-literal': taggedCount / tlCount,

      'types': {
        'same-as-string-literal': sameAsStringLiteral,
        'multi-line-string-literal': multiLineStringLiteral,
        'normal': normal,
        'tagged': tagged,
        'fancy-tagged': fancyTagged,
      },

      'fancy-tagged-tag-types': fancyTaggedNodeTypes,
    };
  },
};
