import test from 'ava';
import coreFields from './core-fields.js';

test('is an array of Bunyan core fields', (t) => {
  t.deepEqual(coreFields, [
    'v',
    'level',
    'name',
    'hostname',
    'pid',
    'time',
    'msg',
    'src',
  ]);
});
