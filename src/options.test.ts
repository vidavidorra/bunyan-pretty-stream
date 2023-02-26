import test from 'ava';
import {getProperty, setProperty} from 'dot-prop';
import {DateTime} from 'luxon';
import {schema} from './options.js';
import type {Options} from './options.js';
import coreFields from './bunyan/core-fields.js';

// https://dev.to/pffigueiredo/typescript-utility-keyof-nested-object-2pa3
type NestedKeyOf<ObjectType extends Record<string, unknown>> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends Record<
    string,
    unknown
  >
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];
type Key = NestedKeyOf<Options>;

type Literal = string | number | boolean;

const defaults = test.macro<[Key, Literal | undefined]>({
  exec(t, key, defaultValue) {
    const options = schema.parse({});
    const value: unknown = getProperty(options, key);
    t.is(value, defaultValue);
  },
  title(_, key, defaultValue) {
    const value = (defaultValue ?? 'undefined')
      .toString()
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n');
    return `defaults "${key}" to "${value}"`;
  },
});

const succeeds = test.macro<[Key, Literal, string]>({
  exec(t, key, value) {
    t.notThrows(() => schema.parse(setProperty({}, key, value)));
  },
  title(_, key, value, description) {
    return `succeeds parsing with ${description} "${key}"`;
  },
});

const fails = test.macro<[Key, Literal, string]>({
  exec(t, key, value) {
    const parsed = schema.safeParse(setProperty({}, key, value));

    t.false(parsed.success);
    if (!parsed.success) {
      t.is(parsed.error.errors.length, 1);
      t.is(parsed.error.errors.at(0)?.path.at(0), key.split('.').at(0));
    }
  },
  title(_, key, value, description) {
    return `fails parsing with ${description} "${key}"`;
  },
});

test('succeeds parsing with an empty object', (t) => {
  t.notThrows(() => schema.parse({}));
});

test(defaults, 'show.time', true);
test(defaults, 'show.name', false);
test(defaults, 'show.hostname', false);
test(defaults, 'show.pid', false);
test(defaults, 'show.source', false);
test(defaults, 'show.extras', true);

test(defaults, 'extras.key', undefined);
test(succeeds, 'extras.key', 'a', 'a single character');
test(succeeds, 'extras.key', 'shortKey', 'a short');
test(succeeds, 'extras.key', 'a'.repeat(1024 * 1024), 'a long');
for (const coreField of coreFields) {
  test(fails, 'extras.key', coreField, `core field "${coreField}" as`);
}

test(fails, 'extras.key', '', 'an empty');

test(defaults, 'extras.maxLength.key', 20);
test(
  succeeds,
  'extras.maxLength.key',
  Number.MAX_SAFE_INTEGER,
  'a maximum integer',
);
test(succeeds, 'extras.maxLength.key', 1, 'a positive');
test(fails, 'extras.maxLength.key', 0, 'a zero');
test(fails, 'extras.maxLength.key', -1, 'a negative');
test(fails, 'extras.maxLength.key', 2.72, 'a non-integer');

test(defaults, 'extras.maxLength.value', 50);
test(
  succeeds,
  'extras.maxLength.value',
  Number.MAX_SAFE_INTEGER,
  'a maximum integer',
);
test(succeeds, 'extras.maxLength.value', 1, 'a positive');
test(fails, 'extras.maxLength.value', 0, 'a zero');
test(fails, 'extras.maxLength.value', -1, 'a negative');
test(fails, 'extras.maxLength.value', 2.72, 'a non-integer');

test(defaults, 'extras.maxLength.total', 500);
test(
  succeeds,
  'extras.maxLength.total',
  Number.MAX_SAFE_INTEGER,
  'a maximum integer',
);
test(succeeds, 'extras.maxLength.total', 1, 'a positive');
test(fails, 'extras.maxLength.total', 0, 'a zero');
test(fails, 'extras.maxLength.total', -1, 'a negative');
test(fails, 'extras.maxLength.total', 2.72, 'a non-integer');

test(defaults, 'indent.details', 4);
test(succeeds, 'indent.details', Number.MAX_SAFE_INTEGER, 'a maximum integer');
test(succeeds, 'indent.details', 1, 'a positive');
test(succeeds, 'indent.details', 0, 'a zero');
test(fails, 'indent.details', -1, 'a negative');
test(fails, 'indent.details', 2.72, 'a non-integer');

test(defaults, 'indent.json', 2);
test(succeeds, 'indent.json', Number.MAX_SAFE_INTEGER, 'a maximum integer');
test(succeeds, 'indent.json', 1, 'a positive');
test(succeeds, 'indent.json', 0, 'a zero');
test(fails, 'indent.json', -1, 'a negative');
test(fails, 'indent.json', 2.72, 'a non-integer');

test(defaults, 'basePath', '/');
test(succeeds, 'basePath', '/', 'a root');
test(succeeds, 'basePath', '/folder', 'an absolute');
test(succeeds, 'basePath', './folder', 'a relative');
test('normalises "basePath"', (t) => {
  t.is(schema.parse({basePath: '/folder/..///.'}).basePath, '/');
});
test(fails, 'basePath', '', 'an empty');

test(defaults, 'newLineCharacter', '\n');
test(succeeds, 'newLineCharacter', '\r', '"\\r" as');
test(succeeds, 'newLineCharacter', '\n', '"\\n" as');
test(succeeds, 'newLineCharacter', '\r\n', '"\\r\\n" as');
test(fails, 'newLineCharacter', 'a', 'a non-EOL character');
test(fails, 'newLineCharacter', '\r\r', '"\\r\\r" as');
test(fails, 'newLineCharacter', '\n\n', '"\\n\\n" as');
test(fails, 'newLineCharacter', '\n\r', '"\\n\\r" as');
test(fails, 'newLineCharacter', '\r\n\r\n', '"\\r\\n\\r\\n" as');

test(defaults, 'time.utc', true);

test(defaults, 'time.preset', 'DATETIME_ISO_8601_OFFSET');
const succeedsWithTimePreset = test.macro<['Luxon preset ' | '', string]>({
  exec(t, name, value) {
    t.notThrows(() => schema.parse({time: {preset: value}}));
    if (name === 'Luxon preset ') {
      t.true(Object.getOwnPropertyNames(DateTime).includes(value));
    }
  },
  title(_, name, value) {
    return `succeeds parsing with ${name}"${value}" as "time.preset"`;
  },
});
test(succeedsWithTimePreset, 'Luxon preset ', 'DATE_SHORT');
test(succeedsWithTimePreset, 'Luxon preset ', 'DATE_MED');
test(succeedsWithTimePreset, 'Luxon preset ', 'DATE_MED_WITH_WEEKDAY');
test(succeedsWithTimePreset, 'Luxon preset ', 'DATE_FULL');
test(succeedsWithTimePreset, 'Luxon preset ', 'DATE_HUGE');
test(succeedsWithTimePreset, 'Luxon preset ', 'TIME_SIMPLE');
test(succeedsWithTimePreset, 'Luxon preset ', 'TIME_WITH_SECONDS');
test(succeedsWithTimePreset, 'Luxon preset ', 'TIME_WITH_SHORT_OFFSET');
test(succeedsWithTimePreset, 'Luxon preset ', 'TIME_WITH_LONG_OFFSET');
test(succeedsWithTimePreset, 'Luxon preset ', 'TIME_24_SIMPLE');
test(succeedsWithTimePreset, 'Luxon preset ', 'TIME_24_WITH_SECONDS');
test(succeedsWithTimePreset, 'Luxon preset ', 'TIME_24_WITH_SHORT_OFFSET');
test(succeedsWithTimePreset, 'Luxon preset ', 'TIME_24_WITH_LONG_OFFSET');
test(succeedsWithTimePreset, 'Luxon preset ', 'DATETIME_SHORT');
test(succeedsWithTimePreset, 'Luxon preset ', 'DATETIME_MED');
test(succeedsWithTimePreset, 'Luxon preset ', 'DATETIME_FULL');
test(succeedsWithTimePreset, 'Luxon preset ', 'DATETIME_HUGE');
test(succeedsWithTimePreset, 'Luxon preset ', 'DATETIME_SHORT_WITH_SECONDS');
test(succeedsWithTimePreset, 'Luxon preset ', 'DATETIME_MED_WITH_SECONDS');
test(succeedsWithTimePreset, 'Luxon preset ', 'DATETIME_FULL_WITH_SECONDS');
test(succeedsWithTimePreset, 'Luxon preset ', 'DATETIME_HUGE_WITH_SECONDS');
test(succeedsWithTimePreset, '', 'TIME_ISO_8601');
test(succeedsWithTimePreset, '', 'TIME_ISO_8601_OFFSET');
test(succeedsWithTimePreset, '', 'DATETIME_ISO_8601');
test(succeedsWithTimePreset, '', 'DATETIME_ISO_8601_OFFSET');

test(defaults, 'time.format', undefined);
test(succeeds, 'time.format', 'a', 'a single character');
test(succeeds, 'time.format', 'HH:mm', 'a short');
test(succeeds, 'time.format', 'a'.repeat(1024 * 1024), 'a long');
test(fails, 'time.format', '', 'an empty');
