import {eGraph, pseudoR, rGraph} from '@enre-ts/data';
import postponedTask from '../container/postponedTask';

export default function () {
  eGraph.reset();
  rGraph.reset();
  pseudoR.reset();
  postponedTask.reset();
}
