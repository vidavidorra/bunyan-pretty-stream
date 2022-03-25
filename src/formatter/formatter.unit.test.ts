import { describe, expect, it } from '@jest/globals';
import { BunyanRecord } from '../bunyan-record';
import { Formatter } from './formatter';
import { ParsedOptions } from '../options';
import stripAnsi from 'strip-ansi';

describe('Formatter', () => {
  const options: Readonly<ParsedOptions> = {
    show: {
      time: true,
      name: false,
      hostname: false,
      pid: false,
      source: false,
      extras: false,
    },
    extras: { maxLength: { key: 20, value: 50, total: 500 } },
    indent: {
      details: 4,
      json: 2,
    },
    basePath: '/',
    newLineCharacter: '\n',
    time: {
      local: false,
      type: 'long',
      format: 'YYYY-MM-DD[T]HH:mm:ss.SSS',
    },
  };

  const defaultMessage: Readonly<BunyanRecord> = {
    v: 0,
    level: 30, // INFO
    name: 'Test',
    hostname: 'test-runner',
    pid: 1,
    time: new Date('2000-01-01T00:00:00.000Z'),
    msg: 'message',
    src: {
      file: 'example.ts',
      line: 10,
      func: 'runExample',
    },
  };

  it('returns true for a record with all core fields', () => {
    const formatter = new Formatter(options);
    const log = formatter.format({
      ...defaultMessage,
      msg: 'multiline\nmessage',
    });

    expect(stripAnsi(log)).toBe(
      '[2000-01-01T00:00:00.000Z]  INFO:\n    multiline\n    message\n',
    );
  });
});
