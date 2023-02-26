import type {DateTimeFormatOptions, ToISOTimeOptions} from 'luxon';
import {DateTime} from 'luxon';
import type {Options} from '../options.js';

type Iso8601Preset =
  | 'TIME_ISO_8601'
  | 'TIME_ISO_8601_OFFSET'
  | 'DATETIME_ISO_8601_OFFSET'
  | 'DATETIME_ISO_8601';

class Formatter {
  private readonly _options: Options['time'];
  private readonly _iso8601Presets: Iso8601Preset[] = [
    'TIME_ISO_8601',
    'TIME_ISO_8601_OFFSET',
    'DATETIME_ISO_8601_OFFSET',
    'DATETIME_ISO_8601',
  ];

  constructor(options: Options['time']) {
    this._options = options;
  }

  format(date: Date): string {
    const dateTime = this._options.utc
      ? DateTime.fromJSDate(date).toUTC()
      : DateTime.fromJSDate(date);

    if (this._options.format !== undefined) {
      return dateTime.toFormat(this._options.format);
    }

    if (this.isIso8601(this._options.preset)) {
      return this.toIso8601(dateTime, this._options.preset);
    }

    return this.toLocaleString(dateTime);
  }

  private isIso8601(
    preset: Options['time']['preset'],
  ): preset is Iso8601Preset {
    return this._iso8601Presets.includes(preset as Iso8601Preset);
  }

  private toIso8601(dateTime: DateTime, preset: Iso8601Preset): string {
    const includeOffset =
      preset === 'TIME_ISO_8601_OFFSET' ||
      preset === 'DATETIME_ISO_8601_OFFSET';
    if (preset === 'TIME_ISO_8601_OFFSET' || preset === 'TIME_ISO_8601') {
      return dateTime.toISOTime({includeOffset});
    }

    return dateTime.toISO({includeOffset});
  }

  private toLocaleString(dateTime: DateTime): string {
    const presetToFormatOptions = new Map<
      Options['time']['preset'],
      DateTimeFormatOptions
    >([
      ['DATE_SHORT', DateTime.DATE_SHORT],
      ['DATE_MED', DateTime.DATE_MED],
      ['DATE_MED_WITH_WEEKDAY', DateTime.DATE_MED_WITH_WEEKDAY],
      ['DATE_FULL', DateTime.DATE_FULL],
      ['DATE_HUGE', DateTime.DATE_HUGE],
      ['TIME_SIMPLE', DateTime.TIME_SIMPLE],
      ['TIME_WITH_SECONDS', DateTime.TIME_WITH_SECONDS],
      ['TIME_WITH_SHORT_OFFSET', DateTime.TIME_WITH_SHORT_OFFSET],
      ['TIME_WITH_LONG_OFFSET', DateTime.TIME_WITH_LONG_OFFSET],
      ['TIME_24_SIMPLE', DateTime.TIME_24_SIMPLE],
      ['TIME_24_WITH_SECONDS', DateTime.TIME_24_WITH_SECONDS],
      ['TIME_24_WITH_SHORT_OFFSET', DateTime.TIME_24_WITH_SHORT_OFFSET],
      ['TIME_24_WITH_LONG_OFFSET', DateTime.TIME_24_WITH_LONG_OFFSET],
      ['DATETIME_SHORT', DateTime.DATETIME_SHORT],
      ['DATETIME_MED', DateTime.DATETIME_MED],
      ['DATETIME_FULL', DateTime.DATETIME_FULL],
      ['DATETIME_HUGE', DateTime.DATETIME_HUGE],
      ['DATETIME_SHORT_WITH_SECONDS', DateTime.DATETIME_SHORT_WITH_SECONDS],
      ['DATETIME_MED_WITH_SECONDS', DateTime.DATETIME_MED_WITH_SECONDS],
      ['DATETIME_FULL_WITH_SECONDS', DateTime.DATETIME_FULL_WITH_SECONDS],
      ['DATETIME_HUGE_WITH_SECONDS', DateTime.DATETIME_HUGE_WITH_SECONDS],
    ]);

    const formatOptions = presetToFormatOptions.get(this._options.preset);
    if (formatOptions === undefined) {
      throw new Error('unknown Luxon preset');
    }

    return dateTime.toLocaleString(formatOptions);
  }
}

export default Formatter;
