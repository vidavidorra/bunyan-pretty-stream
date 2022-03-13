import { Options, schema } from './options';
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
  const defaults: Readonly<{
    options: Options;
  }> = {
    options: {
      show: {
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
    // internalOptions: {
    //   extrasMaxValueLength: 50,
    //   time: {
    //     formats: {
    //       short: 'HH:mm:ss.SSS',
    //       long: 'YYYY-MM-DD[T]HH:mm:ss.SSS',
    //     },
    //   },
    // },
  };

  describe.each([
    ['show.time', 'boolean', true],
    ['show.name', 'boolean', false],
    ['show.hostname', 'boolean', false],
    ['show.pid', 'boolean', false],
    ['show.source', 'boolean', false],
    ['show.extras', 'boolean', true],
    ['extrasKey', 'string', undefined],
    ['indent', 'number', 4],
    ['jsonIndent', 'number', 2],
    ['basePath', 'string', '/'],
    ['newLineCharacter', '\r | \n | \r\n', '\n'],
    ['extrasMaxValueLength', 'number', 50],
    ['time.local', 'boolean', false],
    ['time.type', 'one of [short, long, format]', 'long'],
    ['time.format', 'string', 'YYYY-MM-DD[T]HH:mm:ss.SSS'],
    ['time.formats.short', 'string', 'HH:mm:ss.SSS'],
    ['time.formats.long', 'string', 'YYYY-MM-DD[T]HH:mm:ss.SSS'],
  ])('%s', (path: string, type: string, defaultValue: unknown) => {
    it(`MUST be ${stringify(type)}`, () => {
      const options = clone(defaults.options);
      if (is.undefined(defaultValue)) {
        dotProp.set(options, path, 123);
      } else {
        dotProp.set(options, path, is.number(defaultValue) ? 'abc' : 123);
      }

      const parsed = schema.safeParse(options);

      // const validation = schema.validate(options);

      // expect(validation.error).toBeDefined();
      // expect(validation.error?.isJoi).toBe(true);
      expect(parsed.success).toBe(false);
      if (parsed.success === false) {
        // const typeRe = type.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
        // expect(validation.error?.message).toMatch(
        //   new RegExp(`^"${path}" must be ${typeRe}$`),
        // );
        expect(parsed.error.message).toMatch(
          new RegExp(
            `"(Expected ${type}, received (number|string|123)"|Invalid enum value. Expected)`,
          ),
        );
      }
    });

    it(`defaults to "${stringify(defaultValue)}"`, () => {
      const options = clone(defaults.options);
      dotProp.delete(options, path);
      // const validation = schema.validate(options);
      const parsed = schema.safeParse(options);

      expect(parsed.success).toBe(true);
      if (parsed.success === true) {
        expect(dotProp.get(parsed.data, path)).toEqual(defaultValue);
      }

      // expect(validation.error).toBeUndefined();
      // expect(dotProp.get(validation.value, path)).toEqual(defaultValue);
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
      const parsed = schema.safeParse(options);
      // const validation = schema.validate(options);

      // expect(validation.error).toBeDefined();
      // expect(validation.error?.isJoi).toBe(true);
      // expect(validation.error?.message).toEqual(`"${path}" must be an integer`);
      expect(parsed.success).toBe(false);
      if (parsed.success === false) {
        expect(parsed.error.message).toMatch(
          /"Expected integer, received float"/,
        );
      }
    });

    if (type === 'a positive number') {
      it('MUST NOT be "0"', () => {
        const options = clone(defaults.options);
        dotProp.set(options, path, -1);
        const parsed = schema.safeParse(options);
        // const validation = schema.validate(options);

        // expect(validation.error).toBeDefined();
        // expect(validation.error?.isJoi).toBe(true);
        // expect(validation.error?.message).toEqual(`"${path}" must be ${type}`);
        expect(parsed.success).toBe(false);
        if (parsed.success === false) {
          expect(parsed.error.message).toMatch(
            /"Value should be greater than( or equal to)? 0"/,
          );
        }
      });
    }

    it('MUST NOT be negative', () => {
      const options = clone(defaults.options);
      dotProp.set(options, path, -1);
      const parsed = schema.safeParse(options);
      // const validation = schema.validate(options);

      // expect(validation.error).toBeDefined();
      // expect(validation.error?.isJoi).toBe(true);
      // expect(validation.error?.message).toEqual(`"${path}" must be ${type}`);
      expect(parsed.success).toBe(false);
      if (parsed.success === false) {
        expect(parsed.error.message).toMatch(
          /"Value should be greater than( or equal to)? 0"/,
        );
      }
    });
  });

  describe('extrasKey', () => {
    it.each([
      ...coreFields().map((e) => ['Bunyan core field', e]),
      ['an empty value', ''],
    ])('disallows %s "%s"', (_, value: string) => {
      const options = clone(defaults.options);
      dotProp.set(options, 'extrasKey', value);
      const parsed = schema.safeParse(options);
      // const validation = schema.validate(options);

      // expect(validation.error).toBeDefined();
      // expect(validation.error?.isJoi).toBe(true);
      // expect(validation.error?.message).toBe(
      //   '"extrasKey" contains an invalid value',
      // );
      expect(parsed.success).toBe(false);
      if (parsed.success === false) {
        expect(parsed.error.message).toMatch(
          /"(Invalid|Should be at least 1 characters)"/,
        );
      }
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
      // const validation = schema.validate(options);

      // expect(validation.error).toBeUndefined();
      // expect(validation.value.newLineCharacter).toEqual(value);
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
      // const validation = schema.validate(options);

      // expect(validation.error).toBeDefined();
      // expect(validation.error?.isJoi).toBe(true);
      // expect(validation.error?.message).toMatch(
      //   /^"newLineCharacter" must be one of /,
      // );
      expect(parsed.success).toBe(false);
      if (parsed.success === false) {
        expect(parsed.error.message).toMatch(/"Invalid enum value. Expected /);
      }
    });

    describe('time.type', () => {
      it.each(['short', 'long', 'format'])('allows "%s"', (value: string) => {
        const options = clone(defaults.options);
        dotProp.set(options, 'time.type', value);
        const parsed = schema.safeParse(options);
        // const validation = schema.validate(options);

        // expect(validation.error).toBeUndefined();
        // expect(validation.value.time.type).toEqual(value);
        expect(parsed.success).toBe(true);
        if (parsed.success === true) {
          expect(parsed.data.time.type).toEqual(value);
        }
      });
    });
  });
});
