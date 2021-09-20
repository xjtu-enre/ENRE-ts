import cli from "./cli";
import {usingCore} from "./core";
import global from "./core/utils/global";

cli.parse(process.argv);
const opts = cli.opts();

global.isMultiThreadEnabled = opts.multiThread;
global.isVerboseEnabled = opts.verbose;
global.NUMBER_OF_PROCESSORS = parseInt(process.env.NUMBER_OF_PROCESSORS || '1');

(async () => {
  await usingCore(opts.input, opts.exclude)
})()
