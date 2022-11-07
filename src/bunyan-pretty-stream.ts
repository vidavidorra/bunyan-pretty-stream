import type {TransformCallback} from 'node:stream';
import {Transform} from 'node:stream';
import {fromJsonString, isBunyanRecord} from './bunyan/index.js';
import {Formatter} from './formatter/index.js';
import type {Options} from './options.js';

class PrettyStream extends Transform {
  private readonly _formatter: Formatter;

  constructor(options: Options = {}) {
    super({objectMode: true});

    this._formatter = new Formatter(options);
  }

  _transform(chunk: any, _: BufferEncoding, done: TransformCallback): void {
    if (typeof chunk === 'string') {
      this.push(this._formatter.format(fromJsonString(chunk)));
      done();
    } else if (isBunyanRecord(chunk)) {
      this.push(this._formatter.format(chunk));
      done();
    } else {
      done(new Error('data MUST be a valid bunyan record'));
    }
  }
}

export {PrettyStream};
