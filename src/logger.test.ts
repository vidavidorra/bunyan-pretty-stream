import bunyan from 'bunyan';
import test from 'ava';
import type {Logger} from './logger.js';

test('exposes the Bunyan "trace", "debug", "info", "warn", "error" and "fatal" functions', (t) => {
  const bunyanLogger = bunyan.createLogger({name: 'Logger'});
  const logger: Logger = bunyanLogger;

  t.is(typeof logger.trace, 'function');
  t.is(typeof logger.debug, 'function');
  t.is(typeof logger.info, 'function');
  t.is(typeof logger.warn, 'function');
  t.is(typeof logger.error, 'function');
  t.is(typeof logger.fatal, 'function');
});

test('does not expose any other Bunyan or Node.js functions and properties', (t) => {
  const logger: Required<Logger> = {
    trace: () => true,
    debug: () => true,
    info: () => true,
    warn: () => true,
    error: () => true,
    fatal: () => true,
    // @ts-expect-error TS2322 Assert there is an error about assigning a
    // non-existing property as part of this test. This tries to ensure there
    // is no indexer field like `[key: string]: unknown;` and the type is not
    // extending anything like `Record<string, unknown>`, but cannot test
    // everything possible of course.
    on: () => true,
    addStream: () => true,
  };

  t.not(logger, undefined);
});
