import { MergedOptions, Options, schema } from './options';
import { Formatter } from './formatter';
import { Stream } from 'stream';
import { isBunyanRecord } from './bunyan-record';
import { joi } from './helpers';

class PrettyStream extends Stream {
  readable: boolean;
  writable: boolean;

  private _formatter: Formatter;

  constructor(options: Options = {}) {
    super();
    this.readable = true;
    this.writable = true;

    const validation = schema.validate(options);
    if (!joi.isValid<MergedOptions>(validation, validation.value)) {
      throw validation.error;
    }

    this._formatter = new Formatter(validation.value);
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
