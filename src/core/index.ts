import {getFileList} from "./utils/fileResolver";
import global from "./utils/global";
import {info} from "./utils/cliRender";
import {Worker} from "worker_threads";

export const usingCore = async (
  iPath: string,
  exclude: Array<string>|undefined) => {

  let fl = await getFileList(iPath, exclude);

  // Suggest multi thread functionality if not enabled
  if (!global.isMultiThreadEnabled && (global.NUMBER_OF_PROCESSORS > 1)) {
    info('Multi processor cores detected, running with tag \'-m\' can improve performance significantly');
  }

  const worker = new Worker('./core/parser.js');
  while (fl.length > 0) {
    worker.postMessage(fl.pop())
  }
}
