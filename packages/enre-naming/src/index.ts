import {XMLParser} from 'fast-xml-parser';
import {currentProfile, FormatProfile} from './format-profiles';

export {usingNewFormatProfile} from './format-profiles';

/**
 * Allowed XML name string tags that will form an XML name string.
 */
const allowedTags = ['Anonymous', 'Modified'] as const;

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  /**
   * Has to make `allowedTags` mutable for parser to read in, or a TS error will show.
   * The reason to make `allowedTags` `as const` is for the use of exact identifier inference.
   */
  unpairedTags: allowedTags as unknown as Array<string>,
});

const xmlBuilder = (tag: typeof allowedTags[number], props: Record<string, string>) => {
  let tmp = '<' + tag;

  tmp = Object.keys(props).reduce((prev, curr) =>
      prev + ` ${curr}="${props[curr]}"`
    , tmp);

  return tmp + '>';
};

/**
 * Allowed types for `Anonymous` entity name.
 */
export const ENRENameAnonymousTypes = [
  'Function',
  'ArrowFunction',
  'Method',
  'Class',
  'CallableSignature',
  'NumberIndexSignature',
  'StringIndexSignature',

  // In other languages
  'Namespace',
  'Package',
  'Struct',
  'Union',
  'Enum',

  // To support Understand-cpp
  'Variable',
] as const;
export type ENRENameAnonymousType = typeof ENRENameAnonymousTypes[number];

/**
 * Allowed types for `Modified` entity name.
 */
export const ENRENameModifiedTypes = [
  'StringLiteral',
  'NumericLiteral',
  'PrivateIdentifier'
] as const;
export type ENRENameModifiedType = typeof ENRENameModifiedTypes[number];

/**
 * An object representing properties needed by an anonymous entity.
 */
export type ENRENameAnonymous = {
  /**
   * Indicates in which type of anonymous entity this is.
   */
  readonly as: ENRENameAnonymousType;
}

/**
 * An object representing properties needed by a non-identifier entity.
 */
export type ENRENameModified = {
  readonly raw: string;
  readonly as: Exclude<ENRENameModifiedType, 'NumericLiteral'>;
} | {
  readonly raw: string;
  readonly as: 'NumericLiteral';
  /**
   * As for `NumericLiteral`, the value is normalized base 10 number(in string).
   */
  readonly value: string;
}

export const ENRENamePrintableNameFormats = ['xml', 'simple'] as const;
export type ENRENamePrintableNameFormat = typeof ENRENamePrintableNameFormats[number];

/**
 * Rich object representing an identifier name with associated properties, is used by ENRE internally.
 *
 * When running a test, it is the `printableName` that to be compared for equality.
 */
export type ENREName = {
  /**
   * Holds all information any other output view depends on.
   */
  payload: string | ENRENameAnonymous | ENRENameModified;
  /**
   * Entity's name that in a normalized form,
   * this will align with the node interpreter.
   */
  codeName: string;
  /**
   * Added by entity's start location will be the range of that entity's the most original cursor selectable range.
   */
  codeLength: number;
  /**
   * Formatted(in standard of ENRE or Understand depending on the specific configuration) string that
   * print an object as an XML string for disambiguation.
   * This will be used to form entity's qualified name chain.
   */
  printableName: string;
}

/**
 * ENRE uses complex structure to describe code name if it is not simply an identifier.
 *
 * If the code name is an identifier (in most of the case), ENREName will just be that string;
 * whereas if there are some extra information needs to be record, an object takes that responsibility.
 *
 * When print out, string will be printed as is; object will be printed as an XML string
 * (various examples can be found in the meta block of documentation).
 * If necessary, ENREName can also be formatted in the format of Understand, for easier comparison.
 *
 * This function will also be used in tests to parse an XML string back to the object representing the
 * same information.
 */
export const buildENREName = <T extends ENREName['payload'] = string>(payload: T): ENREName => {
  if (typeof payload === 'string') {
    /**
     * Normal identifier will never be started with '<',
     * so in this case, an XML string is passed in.
     *
     * Since test is written without TypeScript, so there is no need to add `string` type
     * for parameter type if the generic type variable is not string.
     */
    if (payload.charAt(0) === '<') {
      const res = xmlParser.parse(payload);
      const keys = Object.keys(res);

      // @ts-ignore
      if (keys.length === 1 && allowedTags.includes(keys[0])) {
        if (keys[0] === allowedTags[0]) {
          // Anonymous
          return buildENREName<ENRENameAnonymous>(res[allowedTags[0]]);
        } else if (keys[0] === allowedTags[1]) {
          // Modified
          return buildENREName<ENRENameModified>(res[allowedTags[1]]);
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
    // @ts-ignore
    if (ENRENameAnonymousTypes.includes(payload.as)) {
      const {as} = payload as ENRENameAnonymous;
      const trustedPayload: ENRENameAnonymous = {as};

      return {
        payload: trustedPayload,
        codeName: '',
        codeLength: 0,
        printableName: xmlBuilder('Anonymous', trustedPayload),
      };
      // @ts-ignore
    } else if (ENRENameModifiedTypes.includes(payload.as)) {
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
    throw new Error(`Unsupported type ${typeof payload} as payload of ENREName`);
  }

  throw new Error('Unexpected error encountered while building ENREName');
};
