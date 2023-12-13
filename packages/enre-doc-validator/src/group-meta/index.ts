import {ajv, toUrlFriendlyName} from '../common';
import {schemaObj} from './raw';

const validator = ajv.compile(schemaObj);

export default (meta: any) => {
  const valid = validator(meta);

  if (!valid) {
    throw validator.errors;
  }

  meta.name = toUrlFriendlyName(meta.name);

  return meta;
};
