import is from '@sindresorhus/is';
import type BunyanRecord from './record.js';

function isBunyanRecord(value: unknown): value is BunyanRecord {
  return (
    is.plainObject(value) &&
    is.number(value.v) &&
    is.number(value.level) &&
    is.string(value.name) &&
    is.string(value.hostname) &&
    is.number(value.pid) &&
    is.date(value.time) &&
    is.string(value.msg) &&
    (is.undefined(value.src) ||
      (is.plainObject(value.src) &&
        is.number(value.src.line) &&
        (is.undefined(value.src.func) || is.string(value.src.func))))
  );
}

export default isBunyanRecord;
