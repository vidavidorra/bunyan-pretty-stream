import test from 'ava';
import {deleteProperty} from 'dot-prop';
import fromJsonString from './from-json-string.js';
import type BunyanRecord from './record.js';

const bunyanRecord: BunyanRecord = {
  v: 0,
  level: 0,
  name: '',
  hostname: '',
  pid: 0,
  time: new Date(0),
  msg: '',
  src: {
    file: '',
    line: 0,
    func: '',
  },
};

test('parses a JSON string with all core fields', (t) => {
  t.notThrows(() => fromJsonString(JSON.stringify(bunyanRecord)));
});

test('parses a JSON string without "src"', (t) => {
  const record = {...bunyanRecord};
  delete record.src;
  t.notThrows(() => fromJsonString(JSON.stringify(record)));
});

test('parses a JSON string with additional fields', (t) => {
  t.notThrows(() =>
    fromJsonString(JSON.stringify({...bunyanRecord, additional: 1})),
  );
});

const throwsWithoutCoreField = test.macro<[keyof BunyanRecord]>({
  exec(t, key) {
    const record = {...bunyanRecord};
    deleteProperty(record, key.toString());
    t.throws(() => fromJsonString(JSON.stringify(record)));
  },
  title(_, key) {
    return `throws an error for a JSON string without core field "${key}"`;
  },
});
test(throwsWithoutCoreField, 'v');
test(throwsWithoutCoreField, 'level');
test(throwsWithoutCoreField, 'name');
test(throwsWithoutCoreField, 'hostname');
test(throwsWithoutCoreField, 'pid');
test(throwsWithoutCoreField, 'time');
test(throwsWithoutCoreField, 'msg');

test('narrows the type to "BunyanRecord"', (t) => {
  const record = fromJsonString(JSON.stringify(bunyanRecord));

  /**
   * The most important part for this test is that it allows to access
   * attributes, e.g. `.msg` without TypeScript errors.
   */
  t.is(record.msg, bunyanRecord.msg);
});
