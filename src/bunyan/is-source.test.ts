import test from 'ava';
import {type BunyanRecord, type Source} from './record.js';
import isSource from './is-source.js';

const source: Readonly<BunyanRecord['src']> = {file: '', line: 0, func: ''};

const returnsWithout = test.macro<[boolean, keyof Source]>({
  exec(t, expected, key) {
    const value: Source = structuredClone(source);
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete value[key];
    (expected ? t.true : t.false)(isSource(value));
  },
  title(_, expected, key) {
    const expectedString = expected ? 'true' : 'false';
    return `returns "${expectedString}" for a source without "${key}"`;
  },
});

test(returnsWithout, false, 'file');
test(returnsWithout, false, 'line');
test(returnsWithout, true, 'func');

test('returns "true" for a source with all values', (t) => {
  t.true(isSource(source));
});

test('returns "false" for an empty object', (t) => {
  t.false(isSource({}));
});

test('narrows the type to "Source"', (t) => {
  const value: unknown = structuredClone(source);
  if (isSource(value)) {
    t.is(value.file, source.file);
  }
});
