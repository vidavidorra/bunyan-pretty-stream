import test from 'ava';
import {deleteProperty} from 'dot-prop';
import {type BunyanRecord} from './record.js';
import isBunyanRecord from './is-record.js';

const bunyanRecord: Readonly<BunyanRecord> = {
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

test('returns "true" for a record with all core fields', (t) => {
  t.not(bunyanRecord.src, undefined);
  t.true(isBunyanRecord(bunyanRecord));
});

test('returns "true" for a record without "src"', (t) => {
  const record = structuredClone(bunyanRecord);
  deleteProperty(record, 'src');
  t.true(isBunyanRecord(bunyanRecord));
});

test('returns "true" for a record with additional fields', (t) => {
  t.true(isBunyanRecord({...bunyanRecord, additional: 1}));
});

const returnsFalseWithoutCoreField = test.macro<[keyof BunyanRecord]>({
  exec(t, key) {
    const record = structuredClone(bunyanRecord);
    deleteProperty(record, key as string);
    t.false(isBunyanRecord(record));
  },
  title(_, key) {
    return `returns "false" for a record without core field "${key}"`;
  },
});
test(returnsFalseWithoutCoreField, 'v');
test(returnsFalseWithoutCoreField, 'level');
test(returnsFalseWithoutCoreField, 'name');
test(returnsFalseWithoutCoreField, 'hostname');
test(returnsFalseWithoutCoreField, 'pid');
test(returnsFalseWithoutCoreField, 'time');
test(returnsFalseWithoutCoreField, 'msg');

test('narrows the type to "BunyanRecord"', (t) => {
  const record: unknown = bunyanRecord;
  if (isBunyanRecord(record)) {
    t.is(record.msg, bunyanRecord.msg);
  }
});
