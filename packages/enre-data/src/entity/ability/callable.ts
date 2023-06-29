export interface ENREEntityAbilityCallable {
  isAsync: boolean;
  isGenerator: boolean;
}

export const addAbilityCallable = (
  isAsync: boolean,
  isGenerator: boolean,
) => {
  return {
    isAsync,

    isGenerator,
  };
};
