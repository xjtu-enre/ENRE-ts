import {ENREEntityCollectionAll, ENREEntityFunction} from '@enre/data';

/**
 * Given an entity, recursively traverse its points-to items (and their points-tos)
 * to retrieve all callable entities, returned as an array.
 */
export default function flattenPointsTo(entity: ENREEntityCollectionAll): ENREEntityFunction[] {
  if ('pointsTo' in entity) {
    const result = entity.pointsTo.filter(p => p.type === 'function');
    entity.pointsTo.filter(p => p.type !== 'function')
      .forEach(p => result.push(...flattenPointsTo(p)));
    return result;
  } else {
    return [];
  }
}
