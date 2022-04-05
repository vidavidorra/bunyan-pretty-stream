import { ParsedOptions, schema } from './options';
import { describe, expect, it } from '@jest/globals';
import clone from 'clone';
import { coreFields } from './bunyan-record';
import dotProp from 'dot-prop';
import is from '@sindresorhus/is';

function stringify(value: unknown): string {
  if (is.undefined(value)) {
    return 'undefined';
  }
  const stringifiedValue = is.string(value) ? value : JSON.stringify(value);

  return stringifiedValue.replace(/\r/g, '\\r').replace(/\n/g, '\\n');
}

describe('schema', () => {
  const defaults: Readonly<{ options: ParsedOptions }> = {
    options: {
      show: {
        time: true,
        name: false,
        hostname: false,
        pid: false,
        source: false,
        extras: false,
      },
      extras: { maxLength: { key: 20, value: 50, total: 500 } },
      indent: {
        details: 4,
        json: 2,
      },
      basePath: '/',
      newLineCharacter: '\n',
      time: {
        local: false,
        type: 'long',
        format: 'YYYY-MM-DD[T]HH:mm:ss.SSS',
      },
    },
  };

  describe.each([
    ['show.time', 'boolean', true],
    ['show.name', 'boolean', false],
    ['show.hostname', 'boolean', false],
    ['show.pid', 'boolean', false],
    ['show.source', 'boolean', false],
    ['show.extras', 'boolean', true],
    ['extras.key', 'string', undefined],
    ['indent.details', 'number', 4],
    ['indent.json', 'number', 2],
    ['basePath', 'string', '/'],
    ['newLineCharacter', '\r | \n | \r\n', '\n'],
    ['time.local', 'boolean', false],
    ['time.type', 'one of [short, long, format]', 'long'],
    ['time.format', 'string', 'YYYY-MM-DD[T]HH:mm:ss.SSS'],
  ])('%s', (path: string, type: string, defaultValue: unknown) => {
    it(`MUST be ${stringify(type)}`, () => {
      const options = clone(defaults.options);
      if (is.undefined(defaultValue)) {
        dotProp.set(options, path, 123);
      } else {
        dotProp.set(options, path, is.number(defaultValue) ? 'abc' : 123);
      }
      const parsed = schema.safeParse(options);

      expect(parsed.success).toBe(false);
    });

    it(`defaults to "${stringify(defaultValue)}"`, () => {
      const options = clone(defaults.options);
      dotProp.delete(options, path);
      const parsed = schema.safeParse(options);

      expect(parsed.success).toBe(true);
      if (parsed.success === true) {
        expect(dotProp.get(parsed.data, path)).toEqual(defaultValue);
      }
    });
  });

  describe.each([
    ['indent.details', 'greater than or equal to 0'],
    ['indent.json', 'greater than or equal to 0'],
  ])('%s', (path: string, type: string) => {
    it('MUST be an integer', () => {
      const options = clone(defaults.options);
      dotProp.set(options, path, 0.5);
      const parsed = schema.safeParse(options);
      expect(parsed.success).toBe(false);
    });

    if (type === 'a positive number') {
      it('MUST NOT be "0"', () => {
        const options = clone(defaults.options);
        dotProp.set(options, path, -1);
        const parsed = schema.safeParse(options);

        expect(parsed.success).toBe(false);
      });
    }

    it('MUST NOT be negative', () => {
      const options = clone(defaults.options);
      dotProp.set(options, path, -1);
      const parsed = schema.safeParse(options);

      expect(parsed.success).toBe(false);
    });
  });

  describe('extras.key', () => {
    it.each([
      ...coreFields().map((e) => ['Bunyan core field', e]),
      ['an empty value', ''],
    ])('disallows %s "%s"', (_, value: string) => {
      const options = clone(defaults.options);
      dotProp.set(options, 'extras.key', value);
      const parsed = schema.safeParse(options);

      expect(parsed.success).toBe(false);
    });
  });

  describe('newLineCharacter', () => {
    it.each([
      ['\\r', '\r'],
      ['\\n', '\n'],
      ['\\r\\n', '\r\n'],
    ])('allows "%s"', (_, value: string) => {
      const options = clone(defaults.options);
      dotProp.set(options, 'newLineCharacter', value);
      const parsed = schema.safeParse(options);

      expect(parsed.success).toBe(true);
      if (parsed.success === true) {
        expect(parsed.data.newLineCharacter).toEqual(value);
      }
    });

    it.each([
      ['multiple carriage returns "\\r\\r"', '\r\r'],
      ['multiple line feeds "\\n\\n"', '\n\n'],
      ['"\\n\\r"', '\n\r'],
    ])('disallows %s', (_, value: string) => {
      const options = clone(defaults.options);
      dotProp.set(options, 'newLineCharacter', value);
      const parsed = schema.safeParse(options);

      expect(parsed.success).toBe(false);
    });

    describe('time.type', () => {
      it.each(['short', 'long', 'format'])('allows "%s"', (value: string) => {
        const options = clone(defaults.options);
        dotProp.set(options, 'time.type', value);
        const parsed = schema.safeParse(options);

        expect(parsed.success).toBe(true);
        if (parsed.success === true) {
          expect(parsed.data.time.type).toEqual(value);
        }
      });
    });
  });
});
