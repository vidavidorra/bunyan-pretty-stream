import test from 'ava';
import Extras from './extras.js';

const options = {
  start: '(',
  end: ')',
  keyValueSeparator: '=',
  separator: ', ',
} as const;
const extras = new Extras(options);

test('starts a single extra with start character', (t) => {
  t.is(extras.format(['a=1']).at(0), options.start);
});

test('starts two extras with start character', (t) => {
  t.is(extras.format(['a=1', 'b=2']).at(0), options.start);
});

test('starts multiple extras with start character', (t) => {
  t.is(extras.format(['a=1', 'b=2', 'c=3']).at(0), options.start);
});

test('ends a single extra with end character', (t) => {
  t.is(extras.format(['a=1']).at(-1), options.end);
});

test('ends two extras with end character', (t) => {
  t.is(extras.format(['a=1', 'b=2']).at(-1), options.end);
});

test('ends multiple extras with end character', (t) => {
  t.is(extras.format(['a=1', 'b=2', 'c=3']).at(-1), options.end);
});

test('formats a single extra without separator', (t) => {
  t.is(extras.format(['x=y']), `${options.start}x=y${options.end}`);
});

test('separates two extras with a separator', (t) => {
  t.is(
    extras.format(['a=1', 'b=2']),
    `${options.start}a=1${options.separator}b=2${options.end}`,
  );
});

test('separates multiple extras with a separator', (t) => {
  const {separator} = options;
  t.is(
    extras.format(['a=1', 'b=2', 'c=3']),
    `${options.start}a=1${separator}b=2${separator}c=3${options.end}`,
  );
});

test('returns an empty string without extras', (t) => {
  t.is(extras.format([]), '');
});
