import chalk from 'chalk';
import env from './env';
import global from './global';

export const error = (message: string) =>
  console.error(chalk.white.bgRed('[ERROR]') + ' ' + chalk.red(message));

export const errorAndExit = (message: string) => {
  error(message);
  process.exit(-1);
};

export const warn = (message: string) =>
  console.warn(chalk.white.bgYellow('[WARN]') + ' ' + message);

export const debug = (message: string) => {
  if (!env.prod) {
    console.debug(chalk.white.bgBlue('[DEBUG]') + ' ' + message);
  }
};

export const info = (message: string) => {
  console.info(chalk.white.bgGray('[INFO]') + ' ' + message);
};

export const verbose = (title: string, payload: any) => {
  if (global.isVerboseEnabled) {
    console.log(chalk.white.bgGray('[VERBOSE]') + ' ' + title);
    console.log(payload);
  }
};
