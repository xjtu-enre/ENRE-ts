import environment from '@enre/environment';
import chalk from 'chalk';

let verboseState = false;

export const setVerbose = (state: boolean) => {
  verboseState = state;
};

export const error = (message: string) => {
  console.error(chalk.black.bgRedBright(' ERROR ') + ' ' + chalk.redBright(message));
};

export const panic = (message: string) => {
  error(message);
  process.exit(-1);
};

export const warn = (message: string) => {
  console.warn(chalk.black.bgYellowBright(' WARN ') + ' ' + message);
};

export const debug = (message: string) => {
  if (environment.development) {
    console.debug(chalk.black.bgBlueBright(' DEBUG ') + ' ' + message);
  }
};

export const info = (message: string) => {
  console.info(chalk.white.bgGray(' INFO ') + ' ' + message);
};

export const verbose = (title: string, message?: any) => {
  if (verboseState) {
    console.log(chalk.white.bgGray(' VERBOSE ') + ' ' + title);
    message ? console.log(message) : null;
  }
};
