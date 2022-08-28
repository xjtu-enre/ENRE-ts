import {
  ENREEntityCollectionAll,
  ENREEntityCollectionInFile,
  ENREEntityFile,
  recordRelationExport
} from '@enre/container';
import {ENREContext} from './index';

export enum CommandType {
  export,
}

export enum CommandLifeCycleKind {
  disposable,
  onCondition,
  permanent,
}

type Command = {
  cmd: CommandType.export,
  proposer: ENREEntityFile,
  lifeCycle: CommandLifeCycleKind.disposable | CommandLifeCycleKind.onCondition,
  isDefault: boolean,
}

export class CommandStack extends Array<Command> {
  /* Empty */
}

export const createCommandStackHandler = ({cs}: ENREContext) => {
  return (entity: ENREEntityCollectionAll) => {
    if (cs.length === 0) {
      return;
    }

    const top = cs.at(-1) as Command;

    if (top.cmd === CommandType.export) {
      recordRelationExport(
        top.proposer,
        entity,
        (entity as ENREEntityCollectionInFile).location,
        {isDefault: top.isDefault},
      );
      if (top.lifeCycle === CommandLifeCycleKind.disposable) {
        cs.pop();
      }
    }
  };
};
