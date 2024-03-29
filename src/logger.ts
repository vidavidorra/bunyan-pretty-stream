import type bunyan from 'bunyan';

type Logger = Pick<
  ReturnType<typeof bunyan.createLogger>,
  'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
>;

export type {Logger};
