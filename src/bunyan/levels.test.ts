import test from 'ava';
import {type LogLevelString} from 'bunyan';
import levels from './levels.js';

test('contains all Bunyan levels', (t) => {
  t.deepEqual(levels, ['trace', 'debug', 'info', 'warn', 'error', 'fatal']);
});

const isValidLevel = test.macro<[(typeof levels)[number]]>({
  exec(t, level) {
    const bunaynLevel: LogLevelString = level;
    t.is(level, bunaynLevel);
  },
  title: (_, level) => `"${level} is a valid Bunyan level`,
});

for (const level of levels) {
  test(isValidLevel, level);
}
