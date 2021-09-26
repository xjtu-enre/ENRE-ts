let isMultiThreadEnabled: boolean = false;

let isVerboseEnabled: boolean = false;

let NUMBER_OF_PROCESSORS: number = 1;

let indexPath: string = '';

let entityId: number = -1;

let idGen = (): number => {
  entityId += 1;
  return entityId;
}

export default {
  isMultiThreadEnabled,
  isVerboseEnabled,
  NUMBER_OF_PROCESSORS,
  indexPath,
  idGen
}
