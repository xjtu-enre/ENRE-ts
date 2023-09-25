import {ENRERelationExport, ENRERelationImport} from '@enre/data';

export interface ENREEntityAbilityImportExport {
  imports: ENRERelationImport[],
  exports: ENRERelationExport[],
}

export const addAbilityImportExport = () => {
  const imports: ENRERelationImport[] = [];
  const exports: ENRERelationExport[] = [];

  return {
    imports,
    
    exports,
  };
};
