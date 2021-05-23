import Joi from 'joi';
import { coreFields as bunyanCoreFields } from './bunyan-record';
import is from '@sindresorhus/is';

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

const schema = Joi.object().keys({
  enable: Joi.object()
    .keys({
      time: Joi.boolean().default(true),
      name: Joi.boolean().default(false),
      hostname: Joi.boolean().default(false),
      pid: Joi.boolean().default(false),
      source: Joi.boolean().default(false),
      extras: Joi.boolean().default(true),
    })
    .default(),
  extrasKey: Joi.string()
    .disallow(...bunyanCoreFields(), '')
    .default(''),
  indent: Joi.number().integer().min(0).default(4),
  jsonIndent: Joi.number().integer().min(0).default(2),
  basePath: Joi.string().default('/'),
  newLineCharacter: Joi.string().valid('\r', '\n', '\r\n').default('\n'),
  extrasMaxValueLength: Joi.number().integer().positive().default(50),
  time: Joi.object()
    .keys({
      local: Joi.boolean().default(false),
      type: Joi.string().valid('short', 'long', 'format').default('long'),
      format: Joi.string().default('YYYY-MM-DD[T]HH:mm:ss.SSS'),
      formats: Joi.object()
        .keys({
          short: Joi.string().default('HH:mm:ss.SSS'),
          long: Joi.string().default('YYYY-MM-DD[T]HH:mm:ss.SSS'),
        })
        .default(),
    })
    .default(),
});

function isValid<T>(
  error: Joi.ValidationError | undefined,
  value: unknown,
): value is T {
  return is.undefined(error);
}

export { Options, InternalOptions, MergedOptions, schema, isValid };
