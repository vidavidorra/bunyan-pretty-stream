import is from '@sindresorhus/is';
import {type Source} from './record.js';

function isSource(value: unknown): value is Source {
  return (
    is.plainObject(value) &&
    is.string(value.file) &&
    is.number(value.line) &&
    (is.undefined(value.func) || is.string(value.func))
  );
}

export default isSource;
