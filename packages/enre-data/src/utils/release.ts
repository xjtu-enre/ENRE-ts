import {ENRERelationExport, ENRERelationImport, rGraph} from '@enre/data';
import {recordRelationAliasof} from '../relation/variant/aliasof';

/**
 * This function convert entities/relations stored as property
 * into dedicated entities/relations to match the ENRE spec.
 */
export default function () {
  for (const _relation of rGraph.all) {
    if (['import', 'export'].includes(_relation.type)) {
      const relation = _relation as ENRERelationImport | ENRERelationExport;
      if (relation.alias)
        recordRelationAliasof(
          relation.alias,
          relation.to,
          relation.alias.location,
        );
    }
  }
}
