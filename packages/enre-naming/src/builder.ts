import {ENRENameFile} from './xml/tag-file';
import {ENRENameAnonymous, ENRENameAnonymousTypes} from './xml/tag-anonymous';
import {ENRENameModified, ENRENameModifiedTypes} from './xml/tag-modified';
import xmlParser from './utils/xml-parser';
import allowedTags from './xml/allowed-tags';
import xmlBuilder from './utils/xml-builder';
import {currentProfile, FormatProfile} from './format-profiles';

/**
 * Rich object representing an identifier name with associated properties, is used by ENRE internally.
 * When running tests, it is the xml-styled `printableName` that to be compared for equality.
 */
export type ENREName = {
  /**
   * Holds all information that any other output view depends on.
   */
  payload: string | ENRENameFile | ENRENameAnonymous | ENRENameModified;
  /**
   * Entity's name that in a normalized form,
   * this will align with the node interpreter.
   */
  codeName: string;
  /**
   * Added with entity's start column will be the range of that entity's the most original cursor selectable range.
   */
  codeLength: number;
  /**
   * Formatted string that print an object as an XML string for disambiguation (by default).
   * This will be used to form entity's qualified name chain.
   */
  printableName: string;
}

/**
 * ENRE uses complex structure to describe code name if it is not simply an identifier.
 *
 * If the code name is an identifier (in most cases), ENREName is just that string;
 * in contrast, an object takes that responsibility.
 *
 * While outputting, string will be printed as-is; object will be printed as an XML string
 * (various examples can be found in the assertion block of documentations).
 * If necessary, ENREName can also be in other formats.
 *
 * This function will also be used in test environment to parse an XML string back to the object.
 */
export const buildENREName = <T extends ENREName['payload'] = string>(payload: T): ENREName => {
  if (typeof payload === 'string') {
    /**
     * Identifiers do not start with '<',
     * so in this case, an XML string is passed in.
     *
     * Since test is written without TypeScript, so there is no need to add `string` type
     * for parameter type if the generic type parameter is not string.
     */
    if (payload.charAt(0) === '<') {
      const res = xmlParser.parse(payload);
      const keys = Object.keys(res);

      if (keys.length === 1 && allowedTags.includes(keys[0] as any)) {
        if (keys[0] === allowedTags[0]) {
          // File
          return buildENREName<ENRENameFile>(res(allowedTags[0]));
        } else if (keys[0] === allowedTags[1]) {
          // Anonymous
          return buildENREName<ENRENameAnonymous>(res[allowedTags[1]]);
        } else if (keys[0] === allowedTags[2]) {
          // Modified
          return buildENREName<ENRENameModified>(res[allowedTags[2]]);
        }
      } else {
        throw new Error(`Invalid ENREName XML string ${payload}`);
      }
    } else {
      return {
        payload,
        codeName: payload,
        codeLength: payload.length,
        printableName: payload,
      };
    }
  } else if (typeof payload === 'object') {
    if ('ext' in payload) {
      const {base, ext} = payload as ENRENameFile;
      const trustedPayload: ENRENameFile = {base, ext};

      return {
        payload: trustedPayload,
        codeName: base + '.' + ext,
        codeLength: base.length + ext.length + 1,
        printableName: xmlBuilder('File', trustedPayload),
      };
    } else if ('as' in payload) {
      if (ENRENameAnonymousTypes.includes(payload.as as any)) {
        const {as} = payload as ENRENameAnonymous;
        const trustedPayload: ENRENameAnonymous = {as};

        return {
          payload: trustedPayload,
          codeName: '',
          codeLength: 0,
          printableName: xmlBuilder('Anonymous', trustedPayload),
        };
      } else if (ENRENameModifiedTypes.includes(payload.as as any)) {
        const {raw, as} = payload as ENRENameModified;
        let trustedPayload: ENRENameModified;
        let codeName: string;
        let codeLength = raw.length;

        if (as === 'NumericLiteral') {
          const {value} = payload as Extract<ENRENameModified, { value: string }>;

          if (!value) {
            throw new Error('Missing property value for NumericLiteral as ENRENameModified');
          }

          trustedPayload = {raw, as, value};
          /**
           * Follows the behavior of node interpreter and JetBrains IDEs,
           * which using normalized number string as printed key or breadcrumb.
           */
          codeName = value;
        } else {
          trustedPayload = {raw, as};

          switch (as) {
            case 'StringLiteral':
              // Add the length of 2 commas.
              codeLength += 2;
              codeName = `'${raw}'`;
              break;
            case 'PrivateIdentifier':
              // Add the length of sharp(#).
              codeLength += 1;
              codeName = `#${raw}`;
              break;
          }
        }

        return {
          payload: trustedPayload,
          codeName,
          codeLength,
          get printableName() {
            switch (currentProfile) {
              case FormatProfile.default:
                return xmlBuilder('Modified', trustedPayload);
              case FormatProfile.understand:
                return raw;
              case FormatProfile.node:
                return codeName;
            }
          },
        };
      } else {
        throw new Error(`Unexpected property value ${payload.as} for ENREName.payload.as`);
      }
    } else {
      throw new Error('Missing required property for ENREName');
    }
  } else {
    throw new Error(`Unsupported type ${typeof payload} as payload of ENREName`);
  }

  throw new Error('Unexpected error encountered while building ENREName');
};
