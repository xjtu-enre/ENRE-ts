import {promises as fs} from 'fs';

export const getFileContent = async (absPath: string): Promise<string> => {
  return await fs.readFile(absPath, 'utf-8');
};
