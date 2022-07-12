import chalk from 'chalk';

if (process.env.NODE_ENV === undefined) {
  /**
   * The `environment` package usually runs before `logging` package,
   * at this time the colored logging is unavailable,
   * so directly invoke chalk for colorful printing.
   */
  console.warn(chalk.black.bgYellowBright(' WARN ') + ' ' +
    'Environment variable NODE_ENV is not assigned, PRODUCTION is implicitly used');
  process.env.NODE_ENV = 'production';
}

const environment = {
  development: process.env.NODE_ENV === 'development',
  production: process.env.NODE_ENV === 'production',
  test: process.env.NODE_ENV === 'test',
};

export default environment;
