import { InternalOptions, Options, schema } from './options';
import { describe, expect, it } from '@jest/globals';
import clone from 'clone';
import { coreFields } from './bunyan-record';
import dotProp from 'dot-prop';
import is from '@sindresorhus/is';

function stringify(value: unknown): string {
  const stringifiedValue = is.string(value) ? value : JSON.stringify(value);

  return stringifiedValue.replace(/\r/g, '\\r').replace(/\n/g, '\\n');
}

describe('schema', () => {
  const defaults: Readonly<{
    options: Options;
    internalOptions: InternalOptions;
  }> = {
    options: {
      enable: {
        time: true,
        name: false,
        hostname: false,
        pid: false,
        source: false,
        extras: false,
      },
      extrasKey: 'extras',
      indent: 4,
      jsonIndent: 2,
      basePath: '/',
      newLineCharacter: '\n',
      time: {
        local: false,
        type: 'long',
        format: 'YYYY-MM-DD[T]HH:mm:ss.SSS',
      },
    },
    internalOptions: {
      extrasMaxValueLength: 50,
      time: {
        formats: {
          short: 'HH:mm:ss.SSS',
          long: 'YYYY-MM-DD[T]HH:mm:ss.SSS',
        },
      },
    },
  };

  describe.each([
    ['enable.time', 'a boolean', true],
    ['enable.name', 'a boolean', false],
    ['enable.hostname', 'a boolean', false],
    ['enable.pid', 'a boolean', false],
    ['enable.source', 'a boolean', false],
    ['enable.extras', 'a boolean', true],
    ['extrasKey', 'a string', ''],
    ['indent', 'a number', 4],
    ['jsonIndent', 'a number', 2],
    ['basePath', 'a string', '/'],
    ['newLineCharacter', 'one of [\r, \n, \r\n]', '\n'],
    ['extrasMaxValueLength', 'a number', 50],
    ['time.local', 'a boolean', false],
    ['time.type', 'one of [short, long, format]', 'long'],
    ['time.format', 'a string', 'YYYY-MM-DD[T]HH:mm:ss.SSS'],
    ['time.formats.short', 'a string', 'HH:mm:ss.SSS'],
    ['time.formats.long', 'a string', 'YYYY-MM-DD[T]HH:mm:ss.SSS'],
  ])('%s', (path: string, type: string, defaultValue: unknown) => {
    it(`MUST be ${stringify(type)}`, () => {
      const options = clone(defaults.options);
      dotProp.set(options, path, is.number(defaultValue) ? 'abc' : 123);
      const validation = schema.validate(options);

      expect(validation.error).toBeDefined();
      expect(validation.error?.isJoi).toBe(true);
      const typeRe = type.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
      expect(validation.error?.message).toMatch(
        new RegExp(`^"${path}" must be ${typeRe}$`),
      );
    });

    it(`defaults to "${stringify(defaultValue)}"`, () => {
      const options = clone(defaults.options);
      dotProp.delete(options, path);
      const validation = schema.validate(options);

      expect(validation.error).toBeUndefined();
      expect(dotProp.get(validation.value, path)).toEqual(defaultValue);
    });
  });

  describe.each([
    ['indent', 'greater than or equal to 0'],
    ['jsonIndent', 'greater than or equal to 0'],
    ['extrasMaxValueLength', 'a positive number'],
  ])('%s', (path: string, type: string) => {
    it('MUST be an integer', () => {
      const options = clone(defaults.options);
      dotProp.set(options, path, 0.5);
      const validation = schema.validate(options);

      expect(validation.error).toBeDefined();
      expect(validation.error?.isJoi).toBe(true);
      expect(validation.error?.message).toEqual(`"${path}" must be an integer`);
    });

    if (type === 'a positive number') {
      it('MUST NOT be "0"', () => {
        const options = clone(defaults.options);
        dotProp.set(options, path, -1);
        const validation = schema.validate(options);

        expect(validation.error).toBeDefined();
        expect(validation.error?.isJoi).toBe(true);
        expect(validation.error?.message).toEqual(`"${path}" must be ${type}`);
      });
    }

    it('MUST NOT be negative', () => {
      const options = clone(defaults.options);
      dotProp.set(options, path, -1);
      const validation = schema.validate(options);

      expect(validation.error).toBeDefined();
      expect(validation.error?.isJoi).toBe(true);
      expect(validation.error?.message).toEqual(`"${path}" must be ${type}`);
    });
  });

  describe('extrasKey', () => {
    it.each([
      ...coreFields().map((e) => ['Bunyan core field', e]),
      ['an empty value', ''],
    ])('disallows %s "%s"', (_, value: string) => {
      const options = clone(defaults.options);
      dotProp.set(options, 'extrasKey', value);
      const validation = schema.validate(options);

      expect(validation.error).toBeDefined();
      expect(validation.error?.isJoi).toBe(true);
      expect(validation.error?.message).toBe(
        '"extrasKey" contains an invalid value',
      );
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
      const validation = schema.validate(options);

      expect(validation.error).toBeUndefined();
      expect(validation.value.newLineCharacter).toEqual(value);
    });

    it.each([
      ['multiple carriage returns "\\r\\r"', '\r\r'],
      ['multiple line feeds "\\n\\n"', '\n\n'],
      ['"\\n\\r"', '\n\r'],
    ])('disallows %s', (_, value: string) => {
      const options = clone(defaults.options);
      dotProp.set(options, 'newLineCharacter', value);
      const validation = schema.validate(options);

      expect(validation.error).toBeDefined();
      expect(validation.error?.isJoi).toBe(true);
      expect(validation.error?.message).toMatch(
        /^"newLineCharacter" must be one of /,
      );
    });
  });

  describe('time.type', () => {
    it.each(['short', 'long', 'format'])('allows "%s"', (value: string) => {
      const options = clone(defaults.options);
      dotProp.set(options, 'time.type', value);
      const validation = schema.validate(options);

      expect(validation.error).toBeUndefined();
      expect(validation.value.time.type).toEqual(value);
    });
  });
});
