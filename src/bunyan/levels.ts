import {type LogLevelString} from 'bunyan';

const levels: readonly LogLevelString[] = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
] as const;

export default levels;
