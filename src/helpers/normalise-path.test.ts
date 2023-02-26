import test from 'ava';
import normalisePath from './normalise-path.js';

test('normalises a path', (t) => {
  t.is(normalisePath('/test//file.txt'), '/test/file.txt');
});

test('converts a file URL to a path', (t) => {
  t.is(normalisePath('file:///file.txt'), '/file.txt');
});

test('normalises a file URL', (t) => {
  t.is(normalisePath('file:///test//file.txt'), '/test/file.txt');
});
