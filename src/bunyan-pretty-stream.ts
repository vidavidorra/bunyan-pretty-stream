import { Transform, TransformCallback } from 'stream';
import { fromString, isBunyanRecord } from './bunyan-record.js';
import { Formatter } from './formatter/formatter.js';
import { Options } from './options.js';
import is from '@sindresorhus/is';

class PrettyStream extends Transform {
  private _formatter: Formatter;

  constructor(options: Options = {}) {
    super({ objectMode: true });

    this._formatter = new Formatter(options);
  }

  _transform(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    chunk: any,
    encoding: BufferEncoding,
    done: TransformCallback,
  ): void {
    if (is.string(chunk)) {
      this.push(this._formatter.format(fromString(chunk)));
      done();
    } else if (isBunyanRecord(chunk)) {
      this.push(this._formatter.format(chunk));
      done();
    } else {
      done(new Error('data MUST be a valid bunyan record'));
    }
  }
}

export { PrettyStream };
