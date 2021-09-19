import cli from "./cli";
import {usingCore} from "./core";
import global from "./core/utils/global";

cli.parse(process.argv);
const opts = cli.opts();

global.isMultiThreadEnabled = opts.multiThread;
global.isVerboseEnabled = opts.verbose;

(async () => {
  await usingCore(opts.input, opts.exclude)
})()
