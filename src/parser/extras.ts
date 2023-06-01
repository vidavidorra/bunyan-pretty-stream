import {type Options} from '../options.js';
import Extra from '../formatter/extra.js';

class Extras {
  private readonly _options: Options['extras'];
  private readonly _extra: Extra;
  private _extras: string[] = [];
  private _length = 0;

  constructor(options: Options['extras']) {
    this._options = options;
    this._extra = new Extra(this._options.formatCharacters.keyValueSeparator);
  }

  get extras(): string[] {
    return this._extras;
  }

  reset(): void {
    this._extras = [];
    this._length = 0;
  }

  add(key: string, value: unknown): boolean {
    if (
      /\r\n|\r|\n/.test(key) ||
      (typeof value === 'object' && value !== null) ||
      typeof value === 'function' ||
      (typeof value === 'string' && /\r\n|\r|\n/.test(value))
    ) {
      return false;
    }

    const extra = this._extra.format(key, value);
    const length = this.lengthAfterAdding(extra?.formatted.length ?? 0);
    if (
      extra === null ||
      extra.key.length > this._options.maxLength.key ||
      extra.value.length > this._options.maxLength.value ||
      length > this._options.maxLength.total
    ) {
      return false;
    }

    this._extras.push(extra.formatted);
    this._length = length;
    return true;
  }

  private lengthAfterAdding(lengthToAdd: number): number {
    const {formatCharacters} = this._options;
    return (
      this._length +
      lengthToAdd +
      (this._length === 0
        ? formatCharacters.start.length + formatCharacters.end.length
        : formatCharacters.separator.length)
    );
  }
}

export default Extras;
