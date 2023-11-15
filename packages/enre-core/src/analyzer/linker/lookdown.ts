import {ENRELocKey} from '@enre/location';
import {ENREEntityCollectionAll, ENREEntityCollectionInFile} from '@enre/data';
import {JSObjRepr} from '../visitors/common/literal-handler';

/**
 * Concept: Symbol & Entity
 *
 * An **Entity** is a declaration element in the source code, ENRE sees all entities and
 * its belonging relations (parent/children) as the skeleton of code.
 *
 * Entity may not necessarily be named code elements (variable, named function, etc.),
 * but also unnamed code elements (anonymous function, arrow function, etc.).
 *
 * All ENRERelations are and should start from an ENREEntity and end at an ENREEntity.
 *
 * However, entity along is not sufficient for describing all code behaviors. Thus,
 * introducing the concept of **Symbol**:
 *
 * A **symbol** has relevance to the modeling of internal object mechanism representation.
 *
 * Symbols are all named, representing what a developer could refer to and use in the code.
 *
 * Both entity and symbol share the same storage system, that is, ENREEntity. However, in
 * different context, the same ENREEntity can be interpreted as an entity or a symbol.
 *
 * (THIS IS INDEED CONFUSING, DEFINITELY NEEDS A BETTER DESIGN, FOR NOW JUST FOLLOW IT.)
 *
 * For example, given the following function declaration:
 *
 * ```js
 * function foo() { console.log('foo') }
 * foo = () => { console.log('bar') }
 * ```
 *
 * while visiting the FunctionDeclaration AST node, ENRE creates an ENREEntity <entity>
 * with `.name=foo` to represent the fact that a new name `foo` is declared in the scope.
 * In this context, the <entity> serves as a symbol, and only its name matters.
 *
 * ENRE also creates a JSObjRepr <objRepr> that `.callable[0].entity=<entity>` to reflect
 * the fact of `function xxx() {}` that creates a callable (function). Notice that ENRE
 * reuse the <entity> as the <objRepr>'s callable. In this context, <entity> serves as an
 * entity, and it is its type (=function) matters. ENRE also set
 * `<entity>.pointsTo[0]=<objRepr>` to bind the name `foo` with the callable element.
 *
 * In line 2, ENRE creates another ENREEntity <entity2> where `.name=<Anon>` and
 * `.type=function` as well as <objRepr2>, and append <objRepr2> to <entity>.pointsTo to
 * reflect the fact that the symbol `foo` is assigned to a new callable element.
 *
 * (ENRE CURRENTLY IS PATH-INSENSITIVE, AFTER <entity2> IS CREATED, <entity> SHOULD NO
 * LONGER BE ACTIVATED. HOWEVER, THIS FEATURE IS NOT YET IMPLEMENTED.)
 *
 * The data structure graph is as following:
 *
 * ENREEntityStorage (@enre/data.eGraph)
 * |- <entity>
 * |  |- pointsTo
 * |  |  |- 0: <objRepr>
 * |  |  |     |- callable
 * |  |  |     |  |- 0: (.entity) <entity>
 * |  |  |- 1: <objRepr2>
 * |  |  |     |- callable
 * |  |  |     |  |- 0: (.entity) <entity2>
 * |- <entity2>
 * |  |- pointsTo
 * |  |  |- 0: <objRepr2>
 * |  |  |     |- callable
 * |  |  |     |  |- 0: (.entity) <entity2>
 *
 * So given the concept model as described above, if a call to symbol `foo` is met, the
 * following procedure will be executed:
 *
 * 1. Find the symbol `foo` recursively in the scope until the root scope is reached.
 *    (In this example, `foo` can be found, thus omit exception handling.)
 *
 * 2. (1) returns an ENREEntity <entity>, however it should be interpreted as a symbol.
 *    (THOUGH AN ENREEntity IS RETURNED, THE PROCEDURE CANNOT BE STOPPED HERE.)
 *
 * 3. Given the code context is a call expression, ENRE enumerate <entity>'s all pointsTo
 *    and visit all callables.
 *
 * 4. (3) visits <objRepr> and <objRepr2>, and returns <entity> and <entity2>, which
 *    should be interpreted as entity.
 *
 * 5. Bind the call relation, `from` is upper scope entity, `to` is <entity> and <entity2>
 *    respectively as explained in (4).
 */

/**
 * Given an ENREEntity, find a direct children whose location matches the given loc-key.
 *
 * The return should be interpreted as an entity.
 */
export default function lookdown(by: 'loc-key', payload: ENRELocKey, scope: ENREEntityCollectionInFile): ENREEntityCollectionInFile | undefined;
/**
 * Given an ENREEntity, find a direct/indirect item whose name matches the given name
 * in entity's point-to.
 * Given a JSObjRepr, find a direct/indirect item whose key matches the given name
 * in its kv.
 *
 * The return should be interpreted as a symbol.
 */
export default function lookdown(by: 'name', payload: string, scope: ENREEntityCollectionInFile | JSObjRepr): ENREEntityCollectionInFile | undefined;
export default function lookdown(by: 'loc-key' | 'name', payload: ENRELocKey | string, scope: ENREEntityCollectionInFile | JSObjRepr): ENREEntityCollectionAll | undefined {
  let waitingList: any[] | undefined = undefined;
  if (scope.type === 'object') {
    waitingList = [scope];
  } else {
    waitingList = [...scope.children];
  }

  // TODO: Condition disable points-to search?
  if ('pointsTo' in scope) {
    /**
     * `pointsTo` can hold either ENREEntity or JSObjRepr, and ENREEntities are add to list for name searching,
     * JSObjRepr(s) have its own dedicate searching mechanism.
     */
    waitingList.push(...scope.pointsTo.filter(i => i.type !== 'object'));
  }

  for (const item of waitingList) {
    if (by === 'loc-key') {
      if ('location' in item) {
        // @ts-ignore
        if (item.location.start.line === payload.line
          // @ts-ignore
          && item.location.start.column === payload.column) {
          return item;
        }
      }
    } else if (by === 'name') {
      if (item.type === 'object') {
        if ((payload as string) in item.kv) {
          return item.kv[payload as string];
        }
      } else {
        if (item.name.codeName === payload) {
          return item;
        }
      }
    }

    if ('children' in item) {
      waitingList.push(...item.children);
    }
  }

  // if ('pointsTo' in scope) {
  //   for (const objRepr of scope.pointsTo.filter(i => i.type === 'object')) {
  //     if ((payload as string) in objRepr.kv) {
  //       return objRepr.kv[payload as string];
  //     }
  //   }
  // }

  return undefined;
}
