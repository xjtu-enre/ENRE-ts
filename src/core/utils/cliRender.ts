import chalk from "chalk";
import env from "./env";

export const error = (message: string) =>
  console.log(chalk.white.bgRed('[ERROR]') + ' ' + chalk.red(message))

export const errorAndExit = (message: string) => {
  error(message);
  process.exit(-1);
}

export const warning = (message: string) =>
  console.log(chalk.white.bgYellow('[WARNING]') + ' ' + message);

export const debug = (message: string) => {
  if (!env.prod){
    console.log(chalk.white.bgBlue('[DEBUG]') + ' ' + message);
  }
}
