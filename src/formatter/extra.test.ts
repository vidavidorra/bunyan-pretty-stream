import test from 'ava';
import Extra from './extra.js';

const keyValueSeparator = '=';
const extra = new Extra(keyValueSeparator);

test('"key" reflects the formatted key', (t) => {
  t.is(extra.format('key', 1)?.key, 'key');
});

test('"value" reflects the formatted value', (t) => {
  t.is(extra.format('a', 'value')?.value, 'value');
});

test('"formatted" reflects the formatted extra', (t) => {
  t.is(extra.format('key', 'value')?.formatted, `key${keyValueSeparator}value`);
});

const format = test.macro<['key' | 'value', unknown, string, string]>({
  exec(t, type, value, expected) {
    if (type === 'key') {
      t.is(extra.format(value as string, 1)?.key, expected);
    } else {
      t.is(extra.format('key', value)?.value, expected);
    }
  },
  // eslint-disable-next-line max-params
  title(_, type, value, expected, description) {
    const suffix = /^".*"$/.test(expected) ? ' in quotations' : '';
    return `formats ${description}${suffix}`;
  },
});

test(format, 'key', 'key', 'key', 'a key');
test(format, 'key', 'a key', '"a key"', 'a key with spaces');
test(format, 'key', '', '""', 'an empty key');

test(format, 'value', 1, '1', 'a numeric value');
test(format, 'value', true, 'true', 'a boolean value');
test(format, 'value', 'value', 'value', 'a string value');
test(format, 'value', 'a value', '"a value"', 'a string value with spaces');
test(format, 'value', '', '""', 'an empty string value');
test(format, 'value', {a: 1}, '{"a":1}', 'an object value');
test(format, 'value', {}, '{}', 'an empty object value');
test(format, 'value', null, 'null', 'a "null" value');
test(
  format,
  'value',
  '"',
  String.raw`"\""`,
  'a value equal to a quotation mark',
);
test(
  format,
  'value',
  'a"b',
  String.raw`"a\"b"`,
  'a value including a quotation mark',
);
test(
  format,
  'value',
  keyValueSeparator,
  `"${keyValueSeparator}"`,
  'a value equal to the key-value separator',
);
test(
  format,
  'value',
  `value${keyValueSeparator}`,
  `"value${keyValueSeparator}"`,
  'a value including the key-value separator',
);

test('formats a key with spaces and a value in quotations', (t) => {
  t.is(
    extra.format('some key', 1)?.formatted,
    `"some key"${keyValueSeparator}1`,
  );
});

test('formats a key and a value with spaces in quotations', (t) => {
  t.is(
    extra.format('key', 'some value')?.formatted,
    `key${keyValueSeparator}"some value"`,
  );
});

test('formats a key and value with spaces in quotations', (t) => {
  t.is(
    extra.format('some key', 'some value')?.formatted,
    `"some key"${keyValueSeparator}"some value"`,
  );
});

test('returns "null" for an undefined key', (t) => {
  t.is(extra.format(undefined as unknown as string, 1), null);
});

test('returns "null" for an undefined value', (t) => {
  t.is(extra.format('a', undefined), null);
});
