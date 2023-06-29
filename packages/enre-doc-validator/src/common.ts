import Ajv from 'ajv';

export const ajv = new Ajv({useDefaults: true, allowUnionTypes: true});

export const toUrlFriendlyName = (raw: string) => {
  return raw.replaceAll(/[^a-zA-Z\d-]+/g, '-').toLowerCase();
};
