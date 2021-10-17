import { Command } from 'commander/esm.mjs';

const cli = new Command();

const md2testcase = () => {
	console.log(import.meta.url);
}

cli
	.command('testcase')
	.description('generate testcases from docs/entities/* and docs/relations/*')
	.action(md2testcase);

cli.parse(process.argv);
