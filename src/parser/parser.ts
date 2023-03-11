import is from '@sindresorhus/is';
import type BunyanRecord from '../bunyan/record.js';
import type {Options} from '../options.js';
import Extras from './extras.js';

type ParsedRecord = {
  version: BunyanRecord['v'];
  message: BunyanRecord['msg'];
  source: BunyanRecord['src'];
  extras: string[];
  details: Record<string, unknown>;
} & Pick<BunyanRecord, 'level' | 'name' | 'hostname' | 'pid' | 'time'>;

type ParserOptions = {
  show: Options['show']['extras'];
  extras: Options['extras'];
};

class Parser {
  private readonly _extras: Extras;
  private readonly _options: ParserOptions;
  constructor(options: ParserOptions) {
    this._options = options;
    this._extras = new Extras(this._options.extras);
  }

  parse(bunyanRecord: BunyanRecord): ParsedRecord {
    const record = this.toRecord(bunyanRecord);

    if (!this._options.show) {
      return record;
    }

    let extras = record.details;
    if (this._options.extras.key === undefined) {
      record.details = {};
    } else {
      const {[this._options.extras.key]: extrasByKey, ...leftOvers} =
        record.details;
      record.details = leftOvers;
      extras =
        is.plainObject(extrasByKey) && is.nonEmptyObject(extrasByKey)
          ? extrasByKey
          : {[this._options.extras.key]: extrasByKey};
    }

    this._extras.reset();
    for (const [key, value] of Object.entries(extras)) {
      if (!this._extras.add(key, value) && value !== undefined) {
        record.details[key] = value;
      }
    }

    record.extras = this._extras.extras;
    return record;
  }

  private toRecord(bunyanRecord: BunyanRecord): ParsedRecord {
    const {
      v: version,
      level,
      name,
      hostname,
      pid,
      time,
      msg: message,
      src: source,
      ...leftOvers
    } = bunyanRecord;

    return {
      version,
      level,
      name,
      hostname,
      pid,
      time,
      message,
      source,
      extras: [],
      details: leftOvers,
    };
  }
}

export default Parser;
export type {ParsedRecord};
