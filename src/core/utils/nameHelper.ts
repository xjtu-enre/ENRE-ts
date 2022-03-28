import {XMLParser} from 'fast-xml-parser';

export const ENRENameAnonymousTypes = ['function', 'arrowFunction', 'class'] as const;
export type ENRENameAnonymousType = typeof ENRENameAnonymousTypes[number];

export interface ENRENameAnonymousProps {
  type: ENRENameAnonymousType;
}

export interface ENREName {
  isAnonymous: boolean,
  payload: string | ENRENameAnonymousProps,
  codeName: string,
  printableName: string,
}

export enum ENRENameBuildOption {
  value,
  anonymous,
}

export const buildENRECodeName = (
  by: ENRENameBuildOption,
  payload: string | ENRENameAnonymousProps
): ENREName => {
  switch (by) {
  case ENRENameBuildOption.value:
    if (typeof payload !== 'string') {
      throw new Error(`Trying to buildENRECodeName by value, but a payload with type ${typeof payload} was fed.`);
    }
    return {
      isAnonymous: false,
      payload: payload,
      codeName: payload,
      printableName: payload,
    };
  case ENRENameBuildOption.anonymous:
    if (typeof payload === 'string') {
      const props = parseXml(payload);
      return {
        isAnonymous: true,
        payload: {
          type: props.type,
        },
        codeName: '',
        printableName: generateXml(props),
      };
    } else {
      return {
        isAnonymous: true,
        payload,
        codeName: '',
        printableName: generateXml(payload),
      };
    }
  }
};

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
});

const parseXml = (raw: string): ENRENameAnonymousProps => {
  const parsed = xmlParser.parse(raw);

  // validating conditions
  if (parsed.anonymous?.type in ENRENameAnonymousTypes) {
    return parsed.anonymous;
  } else {
    throw new Error(`Invalid name xml ${raw}`);
  }
};

const generateXml = (props: ENRENameAnonymousProps): string => {
  const keys = Object.keys(props) as Array<keyof ENRENameAnonymousProps>;
  const str = keys.map(key => `${key}="${props[key]}"`).reduce((prev, curr) => prev + ' ' + curr);
  return `<anonymous ${str} />`;
};
