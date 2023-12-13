export interface ENREEntityAbilityAbstractable {
  isAbstract: boolean,
}

export const addAbilityAbstractable = (isAbstract: boolean) => {
  return {
    isAbstract,
  };
};
