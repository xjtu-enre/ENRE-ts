import {format, loggers, transports} from 'winston';

const {combine, timestamp, colorize, printf} = format;

const sharedTransports = {
  console: new transports.Console(),
};

export function setLogLevel(level: string) {
  sharedTransports.console.level = level;
}

export default function (source: string) {
  loggers.add(source, {
    format: combine(
      colorize({all: true}),
      timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
      printf(({level, message, timestamp}) => {
        return `${timestamp} [${source}] ${level}: ${message}`;
      })
    ),
    transports: [sharedTransports.console],
  });

  return loggers.get(source);
}
