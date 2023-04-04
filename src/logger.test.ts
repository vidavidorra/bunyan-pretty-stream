import bunyan from 'bunyan';
import test from 'ava';
import {type Logger} from './logger.js';
import {levels} from './index.js';

test(`exposes the Bunyan ${levels
  .map((level) => `"${level}"`)
  .join(', ')} functions`, (t) => {
  const bunyanLogger = bunyan.createLogger({name: 'Logger'});
  const logger: Logger = bunyanLogger;

  for (const level of levels) {
    t.is(typeof logger[level], 'function');
  }
});

test('does not expose any other Bunyan or Node.js functions and properties', (t) => {
  const logger: Required<Logger> = {
    trace: () => true,
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
