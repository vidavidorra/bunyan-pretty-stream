import { MergedOptions, Options, schema } from './options';
import { Formatter } from './formatter';
import { Stream } from 'stream';
import { isBunyanRecord } from './bunyan-record';
import { joi } from './helpers';

class PrettyStream extends Stream.Transform {
  private _formatter: Formatter;

  constructor(options: Options = {}) {
    super();

    const validation = schema.validate(options);
    if (!joi.isValid<MergedOptions>(validation, validation.value)) {
      throw validation.error;
    }

    this._formatter = new Formatter(validation.value);
  }

  _transform(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    chunk: any,
    encoding: BufferEncoding,
    done: (error?: Error | null) => void,
  ): void {
    if (isBunyanRecord(chunk)) {
      this.push(this._formatter.format(chunk));
      done();
    } else {
      done(new Error('data MUST be a valid bunyan record'));
    }
  }
}

export { PrettyStream };
