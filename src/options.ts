import { coreFields as bunyanCoreFields } from './bunyan-record.js';
import { z } from 'zod';

const schema = z
  .object({
    show: z
      .object({
        time: z.boolean().default(true),
        name: z.boolean().default(false),
        hostname: z.boolean().default(false),
        pid: z.boolean().default(false),
        source: z.boolean().default(false),
        extras: z.boolean().default(true),
      })
      .strict()
      .default({}),
    extras: z
      .object({
        key: z
          .string()
          .min(1)
          .regex(new RegExp(`^((?!(${bunyanCoreFields().join('|')})).)*$`))
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
      .strict()
      .default({}),
    indent: z
      .object({
        details: z.number().int().nonnegative().default(4),
        json: z.number().int().nonnegative().default(2),
      })
      .strict()
      .default({}),
    basePath: z.string().min(1).default('/'),
    newLineCharacter: z.enum(['\r', '\n', '\r\n']).default('\n'),
    time: z
      .object({
        type: z.enum(['short', 'long', 'format']).default('long'),
        /**
         * Display local time instead of UTC.
         */
        local: z.boolean().default(false),
        /**
         * Time format as specified by the `Moment.js` [format options](
         * https://momentjs.com/docs/#/displaying/format/).
         *
         * @note The time zone, `Z` or `ZZ`, should be omitted as `Z` is
         * automatically to the format if the time is UTC.
         * @note The `Z` display suffix for UTC times is automatically added to
         * the format and should be omitted.
         */
        format: z.string().min(1).default('YYYY-MM-DD[T]HH:mm:ss.SSS'),
      })
      .strict()
      .default({}),
  })
  .strict();

type Options = z.input<typeof schema>;
type ParsedOptions = z.infer<typeof schema>;

export { Options, ParsedOptions, schema };
