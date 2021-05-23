import { coreFields as bunyanCoreFields } from './bunyan-record';
import { joi } from './helpers';

interface Options {
  enable?: {
    time?: boolean;
    name?: boolean;
    hostname?: boolean;
    pid?: boolean;
    source?: boolean;
    extras?: boolean;
  };

  extrasKey?: string;

  indent?: number;
  jsonIndent?: number;
  basePath?: string;
  newLineCharacter?: '\r' | '\n' | '\r\n';
  time?: {
    type?: 'short' | 'long' | 'format';

    /**
     * Display local time instead of UTC.
     */
    local?: boolean;

    /**
     * Time format as specified by the `Moment.js` [format options](
     * https://momentjs.com/docs/#/displaying/format/).
     *
     * @note The time zone, `Z` or `ZZ`, should be omitted as `Z` is
     * automatically to the format if the time is UTC.
     * @note The `Z` display suffix for UTC times is automatically added to the
     * format and should be omitted.
     */
    format?: string;
  };
}

interface InternalOptions {
  extrasMaxValueLength: number;
  time: {
    formats: {
      short: string;
      long: string;
    };
  };
}

type DeepRequired<T> = {
  [P in keyof T]-?: DeepRequired<T[P]>;
};

type MergedOptions = DeepRequired<Options & InternalOptions>;

const schema = joi.object().keys({
  enable: joi
    .object()
    .keys({
      time: joi.boolean().default(true),
      name: joi.boolean().default(false),
      hostname: joi.boolean().default(false),
      pid: joi.boolean().default(false),
      source: joi.boolean().default(false),
      extras: joi.boolean().default(true),
    })
    .default(),
  extrasKey: joi
    .string()
    .disallow(...bunyanCoreFields(), '')
    .default(''),
  indent: joi.number().integer().min(0).default(4),
  jsonIndent: joi.number().integer().min(0).default(2),
  basePath: joi.string().default('/'),
  newLineCharacter: joi.string().valid('\r', '\n', '\r\n').default('\n'),
  extrasMaxValueLength: joi.number().integer().positive().default(50),
  time: joi
    .object()
    .keys({
      local: joi.boolean().default(false),
      type: joi.string().valid('short', 'long', 'format').default('long'),
      format: joi.string().default('YYYY-MM-DD[T]HH:mm:ss.SSS'),
      formats: joi
        .object()
        .keys({
          short: joi.string().default('HH:mm:ss.SSS'),
          long: joi.string().default('YYYY-MM-DD[T]HH:mm:ss.SSS'),
        })
        .default(),
    })
    .default(),
});

export { Options, InternalOptions, MergedOptions, schema };
