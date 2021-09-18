import {getFileList} from "./utils/pathResolver";

export const usingCore = async (iPath: string) => {
  let fl = await getFileList(iPath);
  console.log(fl);
}
