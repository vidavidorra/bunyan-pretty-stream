import test from 'ava';
import levels from './levels.js';

test('contains all Bunyan levels', (t) => {
  t.deepEqual(levels, ['trace', 'debug', 'info', 'warn', 'error', 'fatal']);
});
