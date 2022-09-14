import allowedTags from '../xml/allowed-tags';

export default (tag: typeof allowedTags[number], props: Record<string, string>) => {
  let tmp = '<' + tag;

  tmp = Object.keys(props).reduce((prev, curr) =>
      prev + ` ${curr}="${props[curr]}"`
    , tmp);

  return tmp + '>';
};
