import isBunyanRecord from './is-record.js';
import {type BunyanRecord} from './record.js';

function fromJsonString(json: string): BunyanRecord {
  const record: unknown = JSON.parse(json, (key, value) => {
    if (
      key === 'time' &&
      typeof value === 'string' &&
      /^((\+-)\d{2})?\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)
    ) {
      return new Date(value);
    }

    return value as unknown;
  });

  if (!isBunyanRecord(record)) {
    throw new Error('string MUST be parsable to a valid Bunyan record');
  }

  return record;
}

export default fromJsonString;
