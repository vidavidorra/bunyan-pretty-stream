import { describe, expect, it } from '@jest/globals';
import { Logger } from './logger';
import bunyan from 'bunyan';
import is from '@sindresorhus/is';

describe('Logger', () => {
  it('exposes the Bunyan trace, debug, info, warn, error, fatal functions', () => {
    const bunyanLogger = bunyan.createLogger({ name: 'Logger' });
    const logger: Logger = bunyanLogger;

    expect(is.function_(logger.trace)).toEqual(true);
    expect(is.function_(logger.debug)).toEqual(true);
    expect(is.function_(logger.info)).toEqual(true);
    expect(is.function_(logger.warn)).toEqual(true);
    expect(is.function_(logger.error)).toEqual(true);
    expect(is.function_(logger.fatal)).toEqual(true);
  });

  it('does not expose any other Bunyan or Node.js functions and properties', () => {
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
      // extending anything like `Record<string, unknown>`.
      x: '',
    };

    expect(logger).not.toBeUndefined();
  });
});
