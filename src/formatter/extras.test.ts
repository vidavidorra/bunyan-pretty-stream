import test from 'ava';
import {Extras} from './extras.js';

const options = {key: 10, value: 20, total: 50} as const;

test('formats key with spaces in quotations', (t) => {
  t.is(new Extras(options).formatExtra('some key', 'value').key, '"some key"');
});

test('formats value with spaces in quotations', (t) => {
  t.is(
    new Extras(options).formatExtra('key', 'some value').value,
    '"some value"',
  );
});

test('formats key and value with spaces in quotations', (t) => {
  const extra = new Extras(options).formatExtra('some key', 'some value');
  t.is(extra.key, '"some key"');
  t.is(extra.value, '"some value"');
});

test('formats with key-value separator', (t) => {
  t.is(new Extras(options).formatExtra('key', 'value').formatted, 'key=value');
});

test('length is "0" for no extras', (t) => {
  t.is(new Extras(options).length, 0);
});

test('length is correct for a single extra', (t) => {
  const extras = new Extras(options);

  const key = 'myKey';
  const value = 'myValue';
  extras.parseAndAdd(key, value);

  t.is(
    extras.length,
    extras.options.start.length +
      key.length +
      extras.options.keyValueSeparator.length +
      value.length +
      extras.options.end.length,
  );
});

test('length is correct for multipe extras', (t) => {
  const extras = new Extras(options);

  const key = 'myKey';
  const value = 'myValue';
  extras.parseAndAdd(`${key}1`, value);
  extras.parseAndAdd(`${key}2`, value);
  t.is(
    extras.length,
    extras.options.start.length +
      (key.length +
        1 +
        extras.options.keyValueSeparator.length +
        value.length) *
        2 +
      extras.options.separator.length +
      extras.options.end.length,
  );
});

test('length is correct for non-included extras', (t) => {
  const extras = new Extras(options);

  const key = 'myKey';
  const value = 'myValue';
  extras.parseAndAdd(key, value);
  extras.parseAndAdd('my very long key that cannot be added', value);
  t.is(
    extras.length,
    extras.options.start.length +
      key.length +
      extras.options.keyValueSeparator.length +
      value.length +
      extras.options.end.length,
  );
});

test('parseAndAdd() returns "true" if the extra was added', (t) => {
  const extras = new Extras(options);
  t.true(extras.parseAndAdd('key', 'value'));
  t.is(extras.extras.length, 1);
});

test('parseAndAdd() returns "true" if the extra was not added', (t) => {
  const extras = new Extras(options);
  t.false(extras.parseAndAdd('my very long key that cannot be added', 'value'));
  t.is(extras.extras.length, 0);
});
