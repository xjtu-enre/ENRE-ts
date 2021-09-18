import cli from "./cli";
import {usingCore} from "./core";

let args = cli.parse(process.argv);
const opts = cli.opts();

(async () => {
  await usingCore(opts.input)
})()
