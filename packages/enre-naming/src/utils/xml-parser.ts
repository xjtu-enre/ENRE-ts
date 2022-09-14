import {XMLParser} from 'fast-xml-parser';
import allowedTags from '../xml/allowed-tags';

export default new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  /**
   * Has to make `allowedTags` not const, or a TS error throws.
   * The reason to make `allowedTags` `as const` is for the use of exact identifier inference.
   */
  unpairedTags: allowedTags as unknown as Array<string>,
});
