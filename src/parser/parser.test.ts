import test from 'ava';
import {type BunyanRecord} from '../bunyan/record.js';
import Parser from './parser.js';

const options = {
  show: true,
  extras: {
    formatCharacters: {
      start: '(',
      end: ')',
      keyValueSeparator: '=',
      separator: ', ',
    },
    maxLength: {key: 10, value: 20, total: 50},
  },
} as const;

const optionsExtrasKey = {
  ...options,
  extras: {...options.extras, key: 'extras'},
} as const;

function record(leftOvers: Record<string, unknown> = {}): BunyanRecord {
  return {
    v: 1,
    level: 2,
    name: 'parser',
    hostname: 'jdoe',
    pid: 123,
    time: new Date('1564-04-23'),
    msg: 'There are no coincidences, Delia. Only the illusion of coincidence.',
    src: {file: '/parser.test.ts', line: 2, func: 'record()'},
    ...leftOvers,
  };
}

test('parses a basic record', (t) => {
  const input = record();
  t.deepEqual(new Parser(options).parse(input), {
    version: input.v,
    level: input.level,
    name: input.name,
    hostname: input.hostname,
    pid: input.pid,
    time: input.time,
    message: input.msg,
    source: input.src,
    extras: [],
    details: {},
  });
});

test('parses extras in a record as "extras"', (t) => {
  const {details, extras} = new Parser(options).parse(record({key: 'value'}));
  t.is(extras.length, 1);
  t.regex(extras.at(0)!, /^key.*value$/);
  t.is(Object.keys(details).length, 0);
});

test('parses extras in a record as "details" when not showing extras', (t) => {
  const {details, extras} = new Parser({...options, show: false}).parse(
    record({key: 'value'}),
  );
  t.deepEqual(Object.entries(details), [['key', 'value']]);
  t.is(extras.length, 0);
});

test('parses details in a record as "details"', (t) => {
  const {details, extras} = new Parser(options).parse(record({key: 'value\n'}));
  t.deepEqual(Object.entries(details), [['key', 'value\n']]);
  t.is(extras.length, 0);
});

test('parses details and extras in a record as "details" and "extras"', (t) => {
  const {details, extras} = new Parser(options).parse(
    record({a: '1', b: '2\n'}),
  );
  t.deepEqual(Object.entries(details), [['b', '2\n']]);
  t.is(extras.length, 1);
  t.regex(extras.at(0)!, /^a.*1$/);
});

test('parses literal value in extras key in a record as "extras"', (t) => {
  const {details, extras} = new Parser(optionsExtrasKey).parse(
    record({extras: 'value'}),
  );
  t.is(extras.length, 1);
  t.regex(extras.at(0)!, /^extras.*value$/);
  t.is(Object.keys(details).length, 0);
});

test('parses extras in extras key in a record as "extras"', (t) => {
  const {details, extras} = new Parser(optionsExtrasKey).parse(
    record({extras: {key: 'value'}}),
  );
  t.is(extras.length, 1);
  t.regex(extras.at(0)!, /^key.*value$/);
  t.is(Object.keys(details).length, 0);
});

test('parses extras outside extras key in a record as "details"', (t) => {
  const {details, extras} = new Parser(optionsExtrasKey).parse(
    record({key: 'value'}),
  );
  t.deepEqual(Object.entries(details), [['key', 'value']]);
  t.is(extras.length, 0);
});

test('parses extras in extras key as "details" when not showing extras', (t) => {
  const {details, extras} = new Parser({
    ...optionsExtrasKey,
    show: false,
  }).parse(record({extras: 'value'}));
  t.deepEqual(Object.entries(details), [['extras', 'value']]);
  t.is(extras.length, 0);
});
