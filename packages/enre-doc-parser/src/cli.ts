import finder, {logger} from '@enre/test-finder';
import {Command} from 'commander';
import {readFile, writeFile} from 'node:fs/promises';
import parser from './index';
import tableBuilder from './table-builder';

const cli = new Command();

const profiles = {
  cpp: {tag: /[cC][pP][pP]/, str: 'cpp', lang: 'C++'},
  java: {tag: /[jJ][aA][vV][aA]/, str: 'java', lang: 'Java'},
  python: {tag: /[pP][yY]([tT][hH][oO][nN])?/, str: 'py / python', lang: 'Python'},
  ts: {tag: undefined, str: undefined, lang: 'TypeScript'},
} as { [lang: string]: { tag?: RegExp, str?: string, lang: string } };

cli
  .description('generate test cases and suites from docs/entity/* or docs/relation/*\nleaving option empty will process all')
  .argument('<lang>', 'Target language: cpp / java / python / ts')
  .option('-e --entity [name...]',
    'specify scope names in docs/entity\nleaving name empty will process all files under docs/entity')
  .option('-r --relation [name...]',
    'specify scope names in docs/relation\nleaving name empty will process all files under docs/relation')
  .action(async (lang: string, opts: any) => {
    if (!['cpp', 'java', 'python', 'ts'].includes(lang)) {
      logger.error(`Unsupported language ${lang}`);
    }

    // If set to scan all, then a table should be generated.
    if (Object.keys(opts).length === 0) {
      let config: any;

      try {
        // TODO: Convert type name into lowercase
        const f = await readFile('doccconfig.json', 'utf-8');
        config = JSON.parse(f);
        logger.info('Using docconfig.json');
      } catch (e) {
        logger.info('doccconfig.json not found');
      }

      const allCategories = await finder(opts);

      const entityTypes: Array<string> = allCategories.filter(i => i.category === 'entity').map(i => i.prettyName.toLowerCase());
      const ignoredEntityTypes: Array<string> = [];
      const ignoredRelationTypes: Array<string> = [];

      for (const ignoredEntity of (config?.ignore?.entity ?? []) as string[]) {
        const str = ignoredEntity.toLowerCase();
        const index = entityTypes.indexOf(str);
        if (index === -1) {
          logger.warn(`Invalid docc config: ignored entity type ${str} does not exist.`);
        } else {
          logger.info(`Set to ignore entity type ${str}`);
          ignoredEntityTypes.push(...entityTypes.splice(index, 1));
        }
      }

      const entityRules: Array<Array<string>> = entityTypes.map(() => []);
      let currentEntity: string | undefined = undefined;
      const relationTable: Array<Array<Array<string>>> = [];
      entityTypes.forEach(() => {
        const column: Array<Array<string>> = [];
        entityTypes.forEach(() => column.push([]));
        relationTable.push(column);
      });

      // Entity case count, Entity item count, Entity negative count; Relation case count, Relation item count, Relation negative count
      const counter = [0, 0, 0, 0, 0, 0];

      const groupByType = {entity: {}, relation: {}};

      await parser(
        // The inner logic makes sure that entity docs are iterated before relation docs
        allCategories,

        async (entry, group) => {
          if (!entry) {
            return;
          }

          if (entry.category === 'entity') {
            currentEntity = entry.prettyName.toLowerCase();
          } else {
            currentEntity = undefined;
          }
        },

        async (path, category, description) => {
          if (category === 'supplemental') {
            return;
          } else {
            if (currentEntity) {
              entityRules[entityTypes.indexOf(currentEntity)].push(description);
            }
          }
        },

        async (path, c) => {
          if (c.assertion.entity) {
            counter[0] += 1;
            c.assertion.entity.items.forEach((i: any) => {
              if (i.negative) {
                counter[2] += 1;
              } else {
                counter[1] += 1;
              }

              if (Object.hasOwn(groupByType.entity, i.type)) {
                // @ts-ignore
                groupByType.entity[i.type] += 1;
              } else {
                // @ts-ignore
                groupByType.entity[i.type] = 1;
              }
            });
          }

          if (c.assertion.relation) {
            counter[3] += 1;
            c.assertion.relation.items.forEach((i: any) => {
              if (i.negative) {
                counter[5] += 1;
              } else {
                counter[4] += 1;
                const fromIndex = entityTypes.indexOf(i.from.type);
                const toIndex = entityTypes.indexOf(i.to.type);
                if (fromIndex === -1 && ignoredEntityTypes.indexOf(i.from.type) === -1) {
                  logger.error(`Undocumented entity type ${i.from.type}`);
                }
                if (toIndex === -1 && ignoredEntityTypes.indexOf(i.to.type) === -1) {
                  logger.error(`Undocumented entity type ${i.to.type}`);
                }

                const type = i.type.toLowerCase();
                if (((config?.ignore?.relation ?? []) as string[]).indexOf(type) === -1) {
                  relationTable[fromIndex][toIndex].includes(type) ? undefined : relationTable[fromIndex][toIndex].push(i.type.toLowerCase());
                } else {
                  if (!ignoredRelationTypes.includes(type)) {
                    logger.info(`Set to ignore relation type ${type}`);
                    ignoredRelationTypes.push(type);
                  }
                }
              }

              if (Object.hasOwn(groupByType.relation, i.type)) {
                // @ts-ignore
                groupByType.relation[i.type] += 1;
              } else {
                // @ts-ignore
                groupByType.relation[i.type] = 1;
              }
            });
          }
        },

        profiles[lang].tag,
        profiles[lang].str,
        true,
      );

      for (const {from, to, type} of (config?.add ?? []) as Array<{ from: string, to: string, type: string }>) {
        const fType = from.toLowerCase();
        const tType = to.toLowerCase();
        const str = type.toLowerCase();

        const fIndex = entityTypes.indexOf(fType);
        const tIndex = entityTypes.indexOf(tType);
        if (fIndex === -1) {
          logger.warn(`Invalid docc config: cannot find entity type ${fType} to manually add a relation`);
        } else if (tIndex === -1) {
          logger.warn(`Invalid docc config: cannot find entity type ${tType} to manually add a relation`);
        } else {
          logger.info(`Manually add a relation ${fType} --${str}-> ${tType}`);
          relationTable[fIndex][tIndex].push(str);
        }
      }

      await tableBuilder(profiles[lang].lang, entityTypes, entityRules, relationTable);

      await writeFile('docc-data.json', JSON.stringify({header: entityTypes, table: relationTable}));

      logger.info(`\nEntity cases: ${counter[0]}\nEntity items: ${counter[1]}\nEntity negative items: ${counter[2]}\nRelation cases: ${counter[3]}\nRelation items: ${counter[4]}\nRelation negative items: ${counter[5]}`);
      logger.info(groupByType);
    } else {
      await parser(
        await finder(opts),
        async (path, group) => group.name !== 'END_OF_PROCESS' ? (logger.info(`Meets group '${group.name}'`), undefined) : undefined,
        async (path, category, description) => (logger.info(`|   Meets rule '${category}: ${description}'`), undefined),
        async (path, c) => (logger.info(`|   |   Meets case '${c.assertion.name}'`), undefined),
        profiles[lang].tag,
        profiles[lang].str,
        true,
      );
    }
  });

cli.parse(process.argv);
