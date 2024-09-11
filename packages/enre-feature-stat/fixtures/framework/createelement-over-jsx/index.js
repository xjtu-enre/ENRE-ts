export default {
  dependencies: ['react-createelement-call'],
  process: (callsite) => {
    let
      callsiteInJS = 0,
      callsiteInJSX = 0,
      componentNameIsStringLiteral = {},
      componentNameNodeIsDynamic = {};

    for (const cs of callsite) {
      if (cs.fileExtName.endsWith('s')) {
        callsiteInJS += 1;
      } else if (cs.fileExtName.endsWith('x')) {
        callsiteInJSX += 1;
      } else {
        throw new Error(`Unexpected file extension ${cs.fileExtName}`);
      }

      if (cs.firstArgNodeType === 'StringLiteral') {
        if (!componentNameIsStringLiteral[cs.firstArgText]) {
          componentNameIsStringLiteral[cs.firstArgText] = 0;
        }

        componentNameIsStringLiteral[cs.firstArgText] += 1;
      } else {
        if (!componentNameNodeIsDynamic[cs.firstArgNodeType]) {
          componentNameNodeIsDynamic[cs.firstArgNodeType] = 0;
        }

        componentNameNodeIsDynamic[cs.firstArgNodeType] += 1;
      }
    }

    return {
      'all-api-callsites': callsite.length,
      'types': {
        'in-js': callsiteInJS,
        'in-jsx': callsiteInJSX,
      },
      'component-names-dynamic-node': componentNameNodeIsDynamic,
      'component-names-string-literal': componentNameIsStringLiteral,
    };
  },
};
