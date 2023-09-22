import {eGraph, ENREEntityFile, ENREEntityPackage, id, recordEntityFile, recordEntityPackage} from '@enre/data';
import {analyse} from './analyzer';
import linker from './analyzer/linker';
import {getFileContent} from './utils/fileUtils';
import ENREName from '@enre/naming';
import {createLogger} from '@enre/shared';
import findFiles from '@enre/path-finder';

export const logger = createLogger('core');
export const codeLogger = createLogger('code analysis');

export default async (
  iPath: string,
  exclude: Array<string> | undefined = undefined
) => {
  const files = await findFiles([iPath], exclude);

  /**
   * PRE PASS: Create package and file entities for every entry.
   */
  const pkgEntities: id<ENREEntityPackage>[] = [];
  for (const file of files) {
    // Create package entity (only if `name` field exists)
    if (file.name === 'package.json') {
      try {
        const pkg = JSON.parse(await getFileContent(file.fullname));

        if (pkg.name) {
          pkgEntities.push(recordEntityPackage(
            new ENREName('Norm', pkg.name),
            file.dir.fullname,
            pkg,
          ));
        }
      } catch (e: any) {
        logger.error(`Failed to parse package.json at ${file.fullname}: ${e.message}`);
      }
    }
    // Create file entity
    else {
      const pkgEntity = pkgEntities.filter(p => file.fullname.includes(p.path!))
        // Sort by path length, so that the most inner package will be selected
        .sort((p1, p2) => p2.path!.length - p1.path!.length)[0];

      const fileEntity = recordEntityFile(
        new ENREName('File', file.name),
        file.fullname,
        // TODO: determine source type by file extension (mxx) and upper package.json
        'module',
        file.ext === 'json' ? 'json' : (file.ext.includes('ts') ? 'ts' : 'js'),
        // Find all packages whose path includes the file's path
        pkgEntity,
      );

      pkgEntity?.children.push(fileEntity);
    }
  }

  /**
   * FIRST PASS: Extract entities and immediate relations, build entity graph.
   */
  for (const f of eGraph.where({type: 'file'})) {
    await analyse(f as id<ENREEntityFile>);
  }

  /**
   * SECOND PASS: Work on pseudo relation container to link string into correlated entity object.
   */
  linker();

  /**
   * THIRD PASS: Based on full entity-relation graph, extracting relations that depends on full data (like 'override').
   */
  // TODO: advancedLinker();
};

export {cleanAnalysis} from './analyzer';
