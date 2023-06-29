import {ENRERelationImport} from '../../relation/variant/import';
import {ENRERelationExport} from '../../relation/variant/export';

export interface ENREEntityAbilityImportExport {
  imports: ENRERelationImport[];
  exports: ENRERelationExport[];
}

export const addAbilityImportExport = () => {
  const imports: ENRERelationImport[] = [];
  const exports: ENRERelationExport[] = [];

  return {
    imports,

    exports,
  };
};
