import { describe, expect, it } from '@jest/globals';
import { Logger } from './logger';
import bunyan from 'bunyan';

describe('Logger', () => {
  it('exposes the Bunyan trace, debug, info, warn, error, fatal function(s)', () => {
    const bunyanLogger = bunyan.createLogger({ name: 'Logger' });
    const logger: Logger = bunyanLogger;

    expect(typeof logger.trace).toEqual('function');
    expect(typeof logger.debug).toEqual('function');
    expect(typeof logger.info).toEqual('function');
    expect(typeof logger.warn).toEqual('function');
    expect(typeof logger.error).toEqual('function');
    expect(typeof logger.fatal).toEqual('function');
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
      // non-existing property as part of this test. This makes sure there is
      // no `Record<string, unknown>` like field allowed on the type.
      x: '',
    };

    expect(logger).not.toBeUndefined();
  });
});
