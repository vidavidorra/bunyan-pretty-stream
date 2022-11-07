import stripAnsi from 'strip-ansi';
import test from 'ava';
import {Formatter} from './formatter.js';

test('formats a multiline message', (t) => {
  const log = new Formatter({}).format({
    v: 0,
    level: 30, // INFO
    name: 'Test',
    hostname: 'test-runner',
    pid: 1,
    time: new Date('2000-01-01T00:00:00.000Z'),
    msg: 'multiline\nmessage',
  });

  t.is(
    stripAnsi(log),
    '[2000-01-01T00:00:00.000Z]  INFO:\n    multiline\n    message\n',
  );
});
