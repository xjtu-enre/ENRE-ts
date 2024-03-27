export default {
  dependencies: ['react-createelement-call'],
  process: (callsite) => {
    let
      callsiteInJS = 0,
      callsiteInJSX = 0,
      componentNameIsStringLiteral = new Set(),
      componentNameNodeIsDynamic = new Set();

    for (const cs of callsite) {
      if (cs.fileExtName.endsWith('s')) {
        callsiteInJS += 1;
      } else if (cs.fileExtName.endsWith('x')) {
        callsiteInJSX += 1;
      } else {
        throw new Error(`Unexpected file extension ${cs.fileExtName}`);
      }

      if (cs.firstArgNodeType === 'StringLiteral') {
        componentNameIsStringLiteral.add(cs.firstArgText);
      } else {
        componentNameNodeIsDynamic.add(cs.firstArgNodeType);
      }
    }

    return {
      'api-callsites': callsite.length,
      'types': {
        'in-js': callsiteInJS,
        'in-jsx': callsiteInJSX,
      },
      'component-names': {
        'dynamicNodeType': [...componentNameNodeIsDynamic],
        'stringLiteral': [...componentNameIsStringLiteral],
      },
    };
  },
};
