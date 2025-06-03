import test from 'ava';
import Formatter from '../formatter/extras.js';
import Extras from './extras.js';

const options = {
  formatCharacters: {
    start: '(',
    end: ')',
    keyValueSeparator: '=',
    separator: ', ',
  },
  maxLength: {key: 10, value: 20, total: 50},
} as const;

const maximum = {
  key: '0'.repeat(options.maxLength.key),
  value: '0'.repeat(options.maxLength.value),
} as const;

test('add › returns "true" if the extra is added', (t) => {
  const extras = new Extras(options);
  t.is(extras.add('key', 1), true);
  t.is(extras.extras.length, 1);
});

test('add › returns "false" if the extra is not added', (t) => {
  const extras = new Extras(options);
  t.is(extras.add('key', undefined), false);
  t.is(extras.extras.length, 0);
});

const add = test.macro<[string, unknown, boolean, string]>({
  exec(t, key, value, result) {
    t.is(new Extras(options).add(key, value), result);
  },
  // eslint-disable-next-line max-params
  title(_, key, value, result, description) {
    const prefix = result ? 'adds' : "doesn't add";
    return `add › ${prefix} ${description}`;
  },
});

test(add, 'key', 1, true, 'string keys');
test(add, '', 1, true, 'an empty string key');
test(add, 'a\r\nkey', 1, false, String.raw`keys with newline character "\r\n"`);
test(add, 'a\rkey', 1, false, String.raw`keys with newline character "\r"`);
test(add, 'a\nkey', 1, false, String.raw`keys with newline character "\n"`);
test(add, 'key', 1, true, 'numeric values');
test(add, 'key', false, true, 'boolean values');
test(add, 'key', null, true, '"null" values');
test(add, 'key', 'value', true, 'string values');
test(add, 'key', '', true, 'empty string values');
test(
  add,
  'key',
  'a\r\nvalue',
  false,
  String.raw`values with newline character "\r\n"`,
);
test(
  add,
  'key',
  'a\rvalue',
  false,
  String.raw`values with newline character "\r"`,
);
test(
  add,
  'key',
  'a\nvalue',
  false,
  String.raw`values with newline character "\n"`,
);
test(add, 'key', {}, false, 'empty object values');
test(add, 'key', {a: 1}, false, 'object values');
test(add, 'key', () => 1, false, 'function values');
test(add, 'key', undefined, false, '"undefined" values');

test(add, maximum.key, 1, true, 'keys equal to the maximum length');
test(add, maximum.key + 'x', 1, false, 'keys longer than the maximum length');
test(add, 'key', maximum.value, true, 'values equal to the maximum length');
test(
  add,
  'key',
  maximum.value + '0',
  false,
  'values longer than the maximum length',
);

function remainingTotalLength(extras: string[]): number {
  return (
    options.maxLength.total -
    new Formatter(options.formatCharacters).format(extras).length -
    options.formatCharacters.separator.length -
    options.formatCharacters.keyValueSeparator.length -
    maximum.key.length
  );
}

test('add › adds extras equal to the total maximum length', (t) => {
  const extras = new Extras(options);
  t.is(extras.add(maximum.key, maximum.value), true);

  const remainingLength = remainingTotalLength(extras.extras);
  t.true(remainingLength > 0);
  t.true(remainingLength <= options.maxLength.value);
  t.is(extras.add(maximum.key, '0'.repeat(remainingLength)), true);
  t.is(
    new Formatter(options.formatCharacters).format(extras.extras).length,
    options.maxLength.total,
  );
});

test('add › adds extras longer than the total maximum length', (t) => {
  const extras = new Extras(options);
  t.is(extras.add(maximum.key, maximum.value), true);

  const remainingLength = remainingTotalLength(extras.extras);
  t.true(remainingLength > 0);
  t.true(remainingLength < options.maxLength.value);
  t.is(extras.add(maximum.key, '0'.repeat(remainingLength + 1)), false);
});

test('extras › contains the formatted extras', (t) => {
  const extras = new Extras(options);
  t.is(extras.add('a', 1), true);
  t.is(extras.add('b', 2), true);
  t.deepEqual(extras.extras, [
    `a${options.formatCharacters.keyValueSeparator}1`,
    `b${options.formatCharacters.keyValueSeparator}2`,
  ]);
});

test('reset › resets "extras"', (t) => {
  const extras = new Extras(options);
  t.is(extras.add('key', 1), true);
  t.is(extras.extras.length, 1);
  extras.reset();
  t.is(extras.extras.length, 0);
});

test('reset › resets lengths', (t) => {
  const extras = new Extras({
    ...options,
    maxLength: {...options.maxLength, total: 10},
  });
  t.is(extras.add('key', 1), true);
  t.is(extras.add('key', 2), false);
  extras.reset();
  t.is(extras.add('key', 1), true);
});

test('reset › can be called successively', (t) => {
  const extras = new Extras(options);
  t.is(extras.add('key', 1), true);
  extras.reset();
  extras.reset();
  t.is(extras.extras.length, 0);
});
