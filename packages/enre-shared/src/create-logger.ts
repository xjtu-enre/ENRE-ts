import {format, loggers, transports} from 'winston';

const {combine, timestamp, colorize, printf} = format;

export default function (source: string) {
  loggers.add(source, {
    format: combine(
      colorize({all: true}),
      timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
      printf(({level, message, timestamp}) => {
        return `${timestamp} [${source}] ${level}: ${message}`;
      })
    ),
    transports: [new transports.Console()],
  });

  return loggers.get(source);
}
