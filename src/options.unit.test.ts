import { InternalOptions, Options, schema } from './options';
import { describe, expect, it } from '@jest/globals';
import { coreFields } from './bunyan-record';
import is from '@sindresorhus/is';

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

  describe('enable', () => {
    describe.each([
      ['time', true],
      ['name', false],
      ['hostname', false],
      ['pid', false],
      ['source', false],
      ['extras', true],
    ])('%s', (key: string, defaultValue: boolean) => {
      it.each([defaultValue])('defaults to "%b"', (value: number) => {
        const options = Object.assign({}, defaults.options, {
          enable: {
            [key]: undefined,
          },
        });
        const validation = schema.validate(options);

        expect(validation.error).toBeUndefined();
        expect(validation.value.enable[key]).toEqual(value);
      });
    });
  });

  describe('extrasKey', () => {
    it.each([
      ...coreFields().map((e) => ['Bunyan core field', e]),
      ['empty value', ''],
    ])('disallows %s "%s"', (_, coreField: string) => {
      const options: Readonly<Options> = {
        ...defaults.options,
        extrasKey: coreField,
      };
      const validation = schema.validate(options);

      expect(validation.error).not.toBeUndefined();
      expect(validation.error?.isJoi).toEqual(true);
      expect(validation.error?.message).toEqual(
        '"extrasKey" contains an invalid value',
      );
    });

    it('defaults to ""', () => {
      const options: Readonly<Options> = {
        ...defaults.options,
        extrasKey: undefined,
      };
      const validation = schema.validate(options);

      expect(validation.error).toBeUndefined();
      expect(validation.value.extrasKey).toEqual('');
    });
  });

  describe.each([
    ['indent', 4],
    ['jsonIndent', 2],
  ])('%s', (key: string, defaultValue: number) => {
    it('must not be less than 0', () => {
      [-100, -2, -1].forEach((value) => {
        const options = {
          ...defaults.options,
          [key]: value,
        } as const;
        const validation = schema.validate(options);

        expect(validation.error).not.toBeUndefined();
        expect(validation.error?.isJoi).toEqual(true);
        expect(validation.error?.message).toEqual(
          `"${key}" must be greater than or equal to 0`,
        );
      });
    });

    it('must be an integer', () => {
      const options = {
        ...defaults.options,
        [key]: 0.5,
      } as const;
      const validation = schema.validate(options);

      expect(validation.error).not.toBeUndefined();
      expect(validation.error?.isJoi).toEqual(true);
      expect(validation.error?.message).toEqual(`"${key}" must be an integer`);
    });

    it.each([0, 1, 100])('may be "%d"', (value: number) => {
      const options = {
        ...defaults.options,
        [key]: value,
      } as const;
      const validation = schema.validate(options);

      expect(validation.error).toBeUndefined();
      expect(validation.value[key]).toEqual(value);
    });

    it.each([defaultValue])('defaults to "%d"', (value: number) => {
      const options: Readonly<Options> = {
        ...defaults.options,
        indent: undefined,
      };
      const validation = schema.validate(options);

      expect(validation.error).toBeUndefined();
      expect(validation.value[key]).toEqual(value);
    });
  });
});
