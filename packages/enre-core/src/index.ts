import {
  eGraph,
  ENREEntityFile,
  ENREEntityPackage,
  recordEntityFile,
  recordEntityPackage
} from '@enre-ts/data';
import {analyze} from './analyzer';
import linker from './analyzer/linker';
import {getFileContent} from './utils/fileUtils';
import ENREName from '@enre-ts/naming';
import {createLogger} from '@enre-ts/shared';
import findFiles from '@enre-ts/path-finder';

export const logger = createLogger('core');
export const codeLogger = createLogger('code analysis');

export default async (
  inputPaths: string[],
  exclude: string[] | undefined = undefined,
) => {
  const files = await findFiles(inputPaths, exclude);

  /**
   * PRE PASS: Create package and file entities to build structure hierarchy.
   */
  logger.info('Starting pass 0: Project structure analysis');
  const pkgEntities: ENREEntityPackage[] = [];
  for (const file of files) {
    // Create package entity (only if `name` field exists)
    if (file.name === 'package.json') {
      try {
        const pkg = JSON.parse(await getFileContent(file.fullname));

        if (pkg.name) {
          pkgEntities.push(recordEntityPackage(
            new ENREName('Pkg', pkg.name),
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
        file.ext.includes('m') || file.ext.includes('t') ? 'module' : (pkgEntity?.pkgJson?.type === 'module' ? 'module' : 'script'),
        file.ext === 'json' ? 'json' : (file.ext.includes('ts') ? 'ts' : 'js'),
        file.ext.includes('x'),
        // Find all packages whose path includes the file's path
        pkgEntity,
      );

      pkgEntity?.children.push(fileEntity);
    }
  }

  /**
   * FIRST PASS: Extract entities and immediate relations, build entity graph.
   */
  logger.info('Starting pass 1: AST traversing, code entity extraction, and postponed task collecting');
  for (const f of eGraph
    .where({type: 'file'})
    .filter(f => (f as ENREEntityFile).lang !== 'json')) {
    await analyze(f as ENREEntityFile);
  }

  /**
   * SECOND PASS: Work on pseudo relation container and postponed task container to link string into correlated entity object.
   */
  logger.info('Starting pass 2: (Explicit/Implicit) Dependency resolving');
  linker();

  /**
   * THIRD PASS: Based on full entity-relation graph, extracting relations that depends on full data (like 'override').
   */
  // TODO: advancedLinker();
};
