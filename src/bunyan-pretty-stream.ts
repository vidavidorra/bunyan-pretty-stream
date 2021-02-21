import { MergedOptions, Options, isValid, schema } from './options';
import { Formatter } from './formatter';
import { Stream } from 'stream';
import { isBunyanRecord } from './bunyan-record';

class PrettyStream extends Stream {
  readable: boolean;
  writable: boolean;

  private _formatter: Formatter;

  constructor(options: Options = {}) {
    super();
    this.readable = true;
    this.writable = true;

    const { error, value } = schema.validate(options);
    if (!isValid<MergedOptions>(error, value)) {
      console.log(error);
      throw new Error('optons');
    }

    this._formatter = new Formatter(value);
    console.dir(value, { depth: null });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  write(chunk: any): boolean {
    if (!isBunyanRecord(chunk)) {
      throw new Error('data is not a bunyan record, forgot to set type raw?');
    }

    this.emit('data', this._formatter.format(chunk));
    return true;
  }

  end(): boolean {
    this.emit('end');
    return true;
  }
}

export { PrettyStream };
