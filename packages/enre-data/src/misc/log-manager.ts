import {ENRELogEntry} from './log-entry';

/**
 * LogManager manages warnings and errors produced while analyzing a certain file,
 * the manager holds all logs (not final printed string, but template and arguments),
 * and maintains the order of logs' code range.
 */
export default class {
  #items: ENRELogItem[] = [];

  add = (line: number, entry: ENRELogEntry, ...args: any[]) => {
    this.#items.push({
      line,
      content: {
        entry,
        args,
      }
    });
  };

  forEach = this.#items.forEach;
}

export interface ENRELogItem {
  /**
   * Currently it is difficulty to determine random token's location,
   * the line number is also not guarantied to be accurate.
   */
  line: number,
  content: ENRELogContent,
}

export interface ENRELogContent {
  entry: ENRELogEntry,
  args: (string | number)[],
}
