import {z} from 'zod';
import bunyanCoreFields from './bunyan/core-fields.js';
import normalisePath from './helpers/normalise-path.js';

const extras = z
  .object({
    key: z
      .string()
      .min(1)
      .regex(new RegExp(`^((?!(${bunyanCoreFields.join('|')})).)*$`))
      .optional(),
    maxLength: z
      .object({
        key: z.number().int().positive().default(20),
        value: z.number().int().positive().default(50),
        total: z.number().int().positive().default(500),
      })
      .strict()
      .default({}),
  })
  .strict();

const publicSchema = z
  .object({
    show: z
      .object({
        time: z.boolean().default(true),
        level: z.boolean().default(true),
        name: z.boolean().default(false),
        hostname: z.boolean().default(false),
        pid: z.boolean().default(false),
        source: z.boolean().default(false),
        extras: z.boolean().default(true),
      })
      .strict()
      .default({}),
    extras: extras.default({}),
    indent: z
      .object({
        details: z.number().int().nonnegative().default(4),
        json: z.number().int().nonnegative().default(2),
      })
      .strict()
      .default({}),
    basePath: z
      .preprocess(
        (arg) =>
          typeof arg === 'string' && arg.length > 0 ? normalisePath(arg) : arg,
        z.string().min(1),
      )
      .default('/'),
    newLineCharacter: z.enum(['\r', '\n', '\r\n']).default('\n'),
    time: z
      .object({
        utc: z.boolean().default(true),

        /**
         * Formatting presets as defined by the [Luxon documentation](
         * https://moment.github.io/luxon/#/formatting?id=presets) with
         * additional custom ISO 8601 presets.
         */
        preset: z
          .enum([
            'DATE_SHORT',
            'DATE_MED',
            'DATE_MED_WITH_WEEKDAY',
            'DATE_FULL',
            'DATE_HUGE',
            'TIME_SIMPLE',
            'TIME_WITH_SECONDS',
            'TIME_WITH_SHORT_OFFSET',
            'TIME_WITH_LONG_OFFSET',
            'TIME_24_SIMPLE',
            'TIME_24_WITH_SECONDS',
            'TIME_24_WITH_SHORT_OFFSET',
            'TIME_24_WITH_LONG_OFFSET',
            'DATETIME_SHORT',
            'DATETIME_MED',
            'DATETIME_FULL',
            'DATETIME_HUGE',
            'DATETIME_SHORT_WITH_SECONDS',
            'DATETIME_MED_WITH_SECONDS',
            'DATETIME_FULL_WITH_SECONDS',
            'DATETIME_HUGE_WITH_SECONDS',
            'TIME_ISO_8601',
            'TIME_ISO_8601_OFFSET',
            'DATETIME_ISO_8601',
            'DATETIME_ISO_8601_OFFSET',
          ])
          .default('DATETIME_ISO_8601_OFFSET'),

        /**
         * Formatting with tokens as defined by the [Luxon documentation](
         * https://moment.github.io/luxon/#/formatting?id=formatting-with-tokens-strings-for-cthulhu).
         */
        format: z.string().min(1).optional(),
      })
      .strict()
      .default({}),
  })
  .strict();

type PublicOptions = z.input<typeof publicSchema>;

const schema = publicSchema.extend({
  extras: extras
    .extend({
      formatCharacters: z
        .object({
          start: z.string().min(1).default('('),
          end: z.string().min(1).default(')'),
          keyValueSeparator: z.string().min(1).default('='),
          separator: z.string().min(1).default(', '),
        })
        .strict()
        .default({}),
    })
    .default({}),
});

type Options = z.infer<typeof schema>;

export {type PublicOptions, type Options, schema};
