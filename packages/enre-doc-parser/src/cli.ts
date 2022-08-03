import finder from '@enre/doc-path-finder';
import {panic} from '@enre/logging';
import {Command} from 'commander';
import parser from './index';

const cli = new Command();

const profiles = {
  cpp: {tag: /[cC][pP][pP]/, str: 'cpp'},
  java: {tag: /[jJ][aA][vV][aA]/, str: 'java'},
  python: {tag: /[pP][yY]([tT][hH][oO][nN])?/, str: 'py / python'},
} as { [lang: string]: { tag: RegExp, str: string } };

cli
  .description('generate test cases and suites from docs/entity/* or docs/relation/*\nleaving option empty will process all')
  .argument('<lang>', 'Target language: cpp / java / python')
  .option('-e --entity [name...]',
    'specify scope names in docs/entity\nleaving name empty will process all files under docs/entity')
  .option('-r --relation [name...]',
    'specify scope names in docs/relation\nleaving name empty will process all files under docs/relation')
  .action(async (lang: string, opts: any) => {
    if (!['cpp', 'java', 'python'].includes(lang)) {
      panic(`Unsupported language ${lang}`);
    }

    await parser(
      finder(opts),
      async (path, group) => group.name !== 'END_OF_PROCESS' ? console.log(`Meets group '${group.name}'`) : undefined,
      async (path, c) => console.log(`Meets case '${c.assertion.name}'`),
      profiles[lang].tag,
      profiles[lang].str,
    );
  });

cli.parse(process.argv);
