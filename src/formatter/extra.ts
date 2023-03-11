class Extra {
  private readonly _keyValueSeparator: string;

  constructor(keyValueSeparator: string) {
    this._keyValueSeparator = keyValueSeparator;
  }

  format(key: string, value: unknown) {
    const stringifiedKey = this.stringify(key);
    const stringifiedValue = this.stringify(value);

    if (stringifiedKey === undefined || stringifiedValue === undefined) {
      return null;
    }

    return {
      formatted: [
        stringifiedKey,
        this._keyValueSeparator,
        stringifiedValue,
      ].join(''),
      key: stringifiedKey,
      value: stringifiedValue,
    };
  }

  private stringify(value: unknown): string | undefined {
    if (
      typeof value === 'string' &&
      value.length > 0 &&
      !/\s|"/.test(value) &&
      !value.includes(this._keyValueSeparator)
    ) {
      return value;
    }

    return JSON.stringify(value);
  }
}

export default Extra;
