import stripAnsi from 'strip-ansi';
import test from 'ava';
import merge from 'deepmerge';
import type {Options, PublicOptions} from '../options.js';
import type BunyanRecord from '../bunyan/record.js';
import {type ParsedRecord} from '../parser/parser.js';
import {Formatter} from './formatter.js';

const defaultOptions = {
  show: {
    time: true,
    level: true,
    name: true,
    hostname: true,
    pid: true,
    source: true,
    extras: true,
  },
  extras: {maxLength: {key: 20, value: 50, total: 500}},
  indent: {details: 4, json: 2},
  basePath: '/',
  newLineCharacter: '\n',
  time: {utc: true, preset: 'DATETIME_ISO_8601_OFFSET'},
} as const;

function record(
  leftOvers: Record<string, unknown> = {},
  source?: Partial<BunyanRecord['src']>,
): Required<BunyanRecord> {
  return {
    v: 1,
    level: 10, // TRACE
    name: 'Bob',
    hostname: 'jdoe',
    pid: 123,
    time: new Date('1564-04-23'),
    msg: 'There are no coincidences, Delia. Only the illusion of coincidence.',
    src: merge(
      {file: 'formatter.test.ts', line: 2, func: undefined},
      source ?? {},
    ),
    ...leftOvers,
  };
}

function format(
  options: PublicOptions = {},
  leftOvers: Record<string, unknown> = {},
  source?: Partial<BunyanRecord['src']>,
) {
  return stripAnsi(
    new Formatter(merge(defaultOptions, options)).format(
      record(leftOvers, source),
    ),
  );
}

const shows = test.macro<[keyof Options['show'], boolean, RegExp]>({
  exec(t, key, show, regex) {
    const leftOvers = {key: 'value'};
    t.true(
      [
        ...JSON.stringify(record(leftOvers)).matchAll(
          new RegExp(regex.source, regex.flags + 'g'),
        ),
      ].length <= 1,
      '"regex" MUST have one match maximum for the test case to be exhaustive',
    );
    const assertion = show ? t.regex : t.notRegex;
    assertion(format({show: {[key]: show}}, leftOvers), regex);
  },
  title(_, key, show) {
    return show
      ? `formats ${key} when showing`
      : `formats without ${key} when not showing`;
  },
});

test(shows, 'time', true, new RegExp(record().time.toISOString()));
test(shows, 'time', false, /1564-04-23T00:00:00.000Z/);
test(shows, 'level', true, /TRACE/);
test(shows, 'level', false, /TRACE/);
test(shows, 'name', true, new RegExp(record().name));
test(shows, 'name', false, new RegExp(record().name));
test(shows, 'hostname', true, new RegExp(record().hostname));
test(shows, 'hostname', false, new RegExp(record().hostname));
test(shows, 'pid', true, new RegExp(record().pid.toString()));
test(shows, 'pid', false, new RegExp(record().pid.toString()));
test(shows, 'source', true, new RegExp(`\\([^)]*?${record().src.file}`));
test(shows, 'source', false, new RegExp(`\\([^)]*?${record().src.file}`));
test(shows, 'extras', true, /\(key.*?value\)/);
test(shows, 'extras', false, /\(key.*?value\)/);

const formatsAtStart = test.macro<
  [keyof ParsedRecord, Array<keyof Options['show']>, string | number | RegExp]
>({
  exec(t, _, keysNotShown, value) {
    t.regex(
      format({
        show: Object.fromEntries(keysNotShown.map((key) => [key, false])),
      }),
      value instanceof RegExp ? value : new RegExp(`^${value}`),
    );
  },
  title(_, key, keysNotShown) {
    return [
      `formats ${key} at the start of the line when`,
      keysNotShown.join(', '),
      keysNotShown.length === 1 ? 'is' : 'are',
      'not shown',
    ].join(' ');
  },
});

test('formats time at the start of the line in square brackets', (t) => {
  t.regex(format(), new RegExp(`^\\[${record().time.toISOString()}\\]`));
});

test('formats level at the start of the line when time is not shown', (t) => {
  t.regex(format({show: {time: false}}), /^TRACE/);
});

test('suffixes the level with a colon (:)', (t) => {
  t.regex(format(), /TRACE:/);
});

test('suffixes the time with a colon (:) when level is not shown', (t) => {
  t.regex(
    format({show: {level: false}}),
    new RegExp(`^\\[${record().time.toISOString()}\\]:`),
  );
});

test(formatsAtStart, 'name', ['time', 'level'], record().name);

test('formats name after level', (t) => {
  t.regex(format(), new RegExp(`TRACE: ${record().name}`));
});

test('formats PID after level when name is not shown', (t) => {
  t.regex(format({show: {name: false}}), new RegExp(`TRACE: ${record().pid}`));
});

test(formatsAtStart, 'pid', ['time', 'level', 'name'], record().pid);

test('formats hostname after level when name and PID are not shown', (t) => {
  t.regex(
    format({show: {name: false, pid: false}}),
    new RegExp(`TRACE: ${record().hostname}`),
  );
});

test(
  formatsAtStart,
  'hostname',
  ['time', 'level', 'name', 'pid'],
  record().hostname,
);

test('formats source after level when name, PID and hostname are not shown', (t) => {
  t.regex(
    format({show: {name: false, pid: false, hostname: false}}),
    new RegExp(`TRACE: \\([^)]*?${record().src.file}`),
  );
});

test(
  formatsAtStart,
  'source',
  ['time', 'level', 'name', 'pid', 'hostname'],
  new RegExp(`^\\([^)]*?${record().src.file}`),
);

test('formats message after level when name, PID, hostname and source are not shown', (t) => {
  t.regex(
    format({show: {name: false, pid: false, hostname: false, source: false}}),
    new RegExp(`TRACE: ${record().msg}`),
  );
});

test(
  formatsAtStart,
  'message',
  ['time', 'level', 'name', 'pid', 'hostname', 'source'],
  record().msg,
);

test('formats source in parenthesis', (t) => {
  t.regex(
    format(),
    new RegExp(`\\([^)]*?${record().src.file}:${record().src.line}\\)`),
  );
});

test('separates source file and line with a colon (:)', (t) => {
  t.regex(format(), new RegExp(`${record().src.file}:${record().src.line}`));
});

test('separates source line and function with " in "', (t) => {
  const func = 'test';
  t.regex(
    format({}, {}, {func}),
    new RegExp(`${record().src.line} in ${func ?? ''}`),
  );
});

test('separates name and PID with a forward slash (/)', (t) => {
  t.regex(format(), new RegExp(`${record().name}/${record().pid}`));
});

test('separates PID and hostname with " on "', (t) => {
  t.regex(format(), new RegExp(`${record().pid} on ${record().hostname}`));
});

test('separates name and hostname with " on " when PID is not shown', (t) => {
  t.regex(
    format({show: {pid: false}}),
    new RegExp(`${record().name} on ${record().hostname}`),
  );
});

test('formats message with newline character "\\r\\n" in details', (t) => {
  t.regex(format({}, {msg: 'with\r\nnew-line'}), /^ +with\n +new-line/m);
});

test('formats message with newline character "\\r" in details', (t) => {
  t.regex(format({}, {msg: 'with\rnew-line'}), /^ +with\n +new-line/m);
});

test('formats message with newline character "\\n" in details', (t) => {
  t.regex(format({}, {msg: 'with\nnew-line'}), /^ +with\n +new-line/m);
});

test('formats details on a new line', (t) => {
  t.regex(format({}, {key: {}}), /^ +key/m);
});

test('formats source relative to "basePath" option', (t) => {
  const file = 'formatter.test.ts';
  t.regex(
    format({basePath: '/tmp'}, {}, {file: `/tmp/${file}`}),
    new RegExp(`\\(${file}:${record().src.line}\\)`),
  );
});

test('formats file URL source relative to "basePath" option', (t) => {
  const file = 'formatter.test.ts';
  t.regex(
    format({basePath: '/tmp'}, {}, {file: `file:///tmp/${file}`}),
    new RegExp(`\\(${file}:${record().src.line}\\)`),
  );
});

test('ends line with characters from "newLineCharacter" option', (t) => {
  t.regex(format({newLineCharacter: '\r\n'}), /\r\n$/);
});

test('indents JSON with "indent.json" option', (t) => {
  const {details, json} = defaultOptions.indent;
  t.regex(
    format({}, {key: {longValue: 'super long value.'.repeat(5)}}),
    new RegExp(`^${' '.repeat(details + json)}"longValue"`, 'm'),
  );
});

test('indents details with "indent.details" option', (t) => {
  t.regex(
    format({}, {key: {}}),
    new RegExp(`^${' '.repeat(defaultOptions.indent.details)}key`, 'm'),
  );
});
