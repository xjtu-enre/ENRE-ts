import {getFileList} from "./utils/pathResolver";
import global from "./utils/global";

export const usingCore = async (
  iPath: string,
  exclude: Array<string>|undefined) => {

  let fl = await getFileList(iPath, exclude);
}
