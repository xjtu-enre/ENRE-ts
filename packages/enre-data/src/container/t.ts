import {ENREEntityCollectionAll} from '../entity/collections';
import {ENREEntityFile} from '../entity/structure/file';
import {ENRERelationCollectionAll, ENRERelationTypes} from '../relation/collections';

const createTaskContainer = () => {
    let callGraph: Map<string, Set<string>> = new Map();
    const add = (scope: any, task: any, location: any) => {
        if(!callGraph.has(scope)){
            callGraph.set(scope + location, new Set());
        }
        // callGraph.get()
    }
    return {
        add
    }

}
export default createTaskContainer();