import { beforeEach, describe, expect, it } from '@jest/globals';
import { Extras } from './extras';

describe('Extras', () => {
  let extras: Extras;
  beforeEach(() => {
    const options = { key: 10, value: 20, total: 50 } as const;
    extras = new Extras(options);
  });

  it('formats an extra key with spaces in quotations', () => {
    const extra = extras.formatExtra('some key', 'value');
    expect(extra.key).toBe('"some key"');
  });

  it('formats an extra value with spaces in quotations', () => {
    const extra = extras.formatExtra('key', 'some value');
    expect(extra.value).toBe('"some value"');
  });

  it('formats an extra key and value with spaces in quotations', () => {
    const extra = extras.formatExtra('some key', 'some value');
    expect(extra.key).toBe('"some key"');
    expect(extra.value).toBe('"some value"');
  });

  it('formats an extra with a key-value separator', () => {
    const extra = extras.formatExtra('key', 'value');
    expect(extra.formatted).toMatch(/^key.+value$/);
  });

  describe('length', () => {
    it('is "0" for no extras', () => {
      expect(extras).toHaveLength(0);
    });

    it('is the correct length for a single extra', () => {
      const key = 'myKey';
      const value = 'myValue';

      extras.parseAndAdd(key, value);
      expect(extras).toHaveLength(
        extras.options.start.length +
          key.length +
          extras.options.keyValueSeparator.length +
          value.length +
          extras.options.end.length,
      );
    });

    it('is the correct length for a multiple extras', () => {
      const key = 'myKey';
      const value = 'myValue';
      extras.parseAndAdd(`${key}1`, value);
      extras.parseAndAdd(`${key}2`, value);
      expect(extras).toHaveLength(
        extras.options.start.length +
          (key.length +
            1 +
            extras.options.keyValueSeparator.length +
            value.length) *
            2 +
          extras.options.separator.length +
          extras.options.end.length,
      );
    });

    it('is the correct length for non-included extras', () => {
      const key = 'myKey';
      const value = 'myValue';
      extras.parseAndAdd(key, value);
      extras.parseAndAdd('my very long key that cannot be added', value);
      expect(extras).toHaveLength(
        extras.options.start.length +
          key.length +
          extras.options.keyValueSeparator.length +
          value.length +
          extras.options.end.length,
      );
    });
  });

  describe('parseAndAdd', () => {
    it('returns "true" if the extra was added', () => {
      expect(extras.parseAndAdd('myKey', 'myValue')).toBe(true);
    });

    it('returns "false" if the extra was not added', () => {
      expect(
        extras.parseAndAdd('my very long key that cannot be added', 'myValue'),
      ).toBe(false);
    });

    it('adds the extra if it can', () => {
      expect(extras.extras).toHaveLength(0);
      extras.parseAndAdd('myKey', 'myValue');
      expect(extras.extras).toHaveLength(1);
      extras.parseAndAdd('otherKey', null);
      expect(extras.extras).toHaveLength(2);
    });

    it('does not add the extra if it is invalid', () => {
      expect(extras.extras).toHaveLength(0);
      extras.parseAndAdd('my very long key that cannot be added', 'myValue');
      expect(extras.extras).toHaveLength(0);
    });
  });
});
