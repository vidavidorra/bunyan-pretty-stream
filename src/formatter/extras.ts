import { ParsedOptions } from '../options.js';

class Extras {
  readonly options = {
    keyValueSeparator: '=',
    separator: ', ',
    start: '(',
    end: ')',
  } as const;

  private readonly _maxLength: ParsedOptions['extras']['maxLength'];
  private _extras: string[];
  private _length: number;

  constructor(maxLength: ParsedOptions['extras']['maxLength']) {
    this._maxLength = maxLength;
    this._length = 0;
    this._extras = [];
  }

  get length() {
    return this._length;
  }

  get extras() {
    return this._extras;
  }

  /**
   * Parse a key-value pair and add to the extras if it is a valid extra.
   *
   * @param key
   * @param value
   * @returns `true` if the key-value was valid and is added, false otherwise.
   */
  parseAndAdd(key: string, value: unknown): boolean {
    if (
      (typeof value === 'object' && value !== null) ||
      typeof value === 'function'
    ) {
      return false;
    }

    const extra = this.formatExtra(key, value);
    if (
      extra.key.length > this._maxLength.key ||
      extra.value.length > this._maxLength.value ||
      this.lengthAfterAdding(extra.formatted) > this._maxLength.total
    ) {
      return false;
    }

    this.add(extra.formatted);
    return true;
  }

  format(): string {
    if (this._extras.length === 0) {
      return '';
    }

    return [
      this.options.start,
      this._extras.join(this.options.separator),
      this.options.end,
    ].join('');
  }

  formatExtra(
    key: string,
    value: unknown,
  ): { formatted: string; key: string; value: string } {
    const stringifiedKey = this.stringify(key);
    const stringifiedValue = this.stringify(value);
    const formatted = [
      stringifiedKey,
      this.options.keyValueSeparator,
      stringifiedValue,
    ].join('');

    return {
      formatted,
      key: stringifiedKey,
      value: stringifiedValue,
    };
  }

  private lengthAfterAdding(formattedExtra: string): number {
    let length = this._length + formattedExtra.length;
    if (this._length === 0) {
      length += this.options.start.length + this.options.end.length;
    } else if (this._extras.length >= 1) {
      length += this.options.separator.length;
    }

    return length;
  }

  private add(formattedExtra: string): void {
    this._extras.push(formattedExtra);
    this._length = this.lengthAfterAdding(formattedExtra);
  }

  private stringify(value: unknown): string {
    if (
      typeof value === 'string' &&
      value.length > 0 &&
      !this.containsWhitespace(value) &&
      !value.includes(this.options.keyValueSeparator)
    ) {
      return value;
    }

    return JSON.stringify(value);
  }

  private containsWhitespace(value: string): boolean {
    return /\s/.test(value);
  }
}

export { Extras };
