import { BunyanRecord, coreFields } from './bunyan-record';
import { MergedOptions } from './options';
import bunyan from 'bunyan';
import chalk from 'chalk';
import moment from 'moment';
import path from 'path';
import stringify from 'json-stringify-pretty-compact';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitise(obj: any): any {
  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined) {
      delete obj[key];
    } else if (typeof value === 'object' && value !== null) {
      sanitise(value);
    }
  });

  return obj;
}

interface ParsedRecord
  extends Pick<BunyanRecord, 'level' | 'name' | 'hostname' | 'pid'> {
  version: BunyanRecord['v'];
  time: moment.Moment;
  message: BunyanRecord['msg'];
  source: BunyanRecord['src'];

  /* eslint-disable @typescript-eslint/no-explicit-any */
  extras: Record<string, any>;
  details: Record<string, any>;
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

class Formatter {
  private readonly _options: Readonly<MergedOptions>;
  private readonly _regex = {
    newLine: /\r\n|\r|\n/,
    whitespace: /\s/,
  } as const;
  private readonly _levels: Readonly<Record<number, string>>;

  constructor(options: MergedOptions) {
    options.basePath = path.normalize(options.basePath);
    this._options = options;

    this._levels = {
      [bunyan.levelFromName.trace]: chalk.gray('TRACE'),
      [bunyan.levelFromName.debug]: chalk.blue('DEBUG'),
      [bunyan.levelFromName.info]: chalk.green(' INFO'),
      [bunyan.levelFromName.warn]: chalk.magenta(' WARN'),
      [bunyan.levelFromName.error]: chalk.red('ERROR'),
      [bunyan.levelFromName.fatal]: chalk.bgRed('FATAL'),
    };
  }

  parse(record: BunyanRecord): ParsedRecord {
    const parsed: ParsedRecord = {
      version: record.v,
      level: record.level,
      name: record.name,
      hostname: record.hostname,
      pid: record.pid,
      time: moment(record.time),
      message: record.msg,
      source: record.src,
      extras: {},
      details: sanitise(record),
    };

    Object.keys(parsed.details).forEach((key) => {
      if (coreFields().includes(key)) {
        delete parsed.details[key];
      }
    });

    if (!this._options.enable.extras) {
      return parsed;
    }

    const extras = parsed.details[this._options.extrasKey];
    if (
      this._options.extrasKey !== '' &&
      typeof extras == 'object' &&
      extras !== null &&
      Object.keys(extras).length !== 0
    ) {
      Object.entries(parsed.details[this._options.extrasKey]).forEach(
        ([key, value]) => {
          if (this.isExtra(value)) {
            parsed.extras[key] = value;
            delete parsed.details[this._options.extrasKey][key];
          }
        },
      );
    } else if (this._options.extrasKey === '') {
      Object.entries(parsed.details).forEach(([key, value]) => {
        if (this.isExtra(value)) {
          parsed.extras[key] = value;
          delete parsed.details[key];
        }
      });
    }

    return parsed;
  }

  format(record: BunyanRecord): string {
    const parsedRecord = this.parse(record);

    return [
      this.formatTime(moment(parsedRecord.time)),
      this.formatLevel(parsedRecord.level),
      ':',
      this.formatName(parsedRecord.name),
      this.formatPid(parsedRecord.pid),
      this.formatHostname(parsedRecord.hostname),
      this.formatSource(parsedRecord.source),
      this.formatMessage(parsedRecord.message),
      this.formatExtras(parsedRecord.extras),
      this._options.newLineCharacter,
      this.formatDetails(parsedRecord.message, parsedRecord.details),
    ].join('');
  }

  formatTime(time: ParsedRecord['time']): string {
    if (!this._options.enable.time) {
      return '';
    }

    let format = this._options.time.format;
    if (this._options.time.type === 'short') {
      format = this._options.time.formats.short;
    } else if (this._options.time.type === 'long') {
      format = this._options.time.formats.long;
    }

    if (!this._options.time.local) {
      time.utc();
      format = format.concat('[Z]');
    }

    return `[${time.format(format)}]`;
  }

  formatLevel(level: ParsedRecord['level']): string {
    const prefix = this._options.enable.time ? ' ' : '';
    return `${prefix}${this._levels[level]}`;
  }

  formatName(name: ParsedRecord['name']): string {
    if (!this._options.enable.name) {
      return '';
    }

    return ` ${name}`;
  }

  formatPid(pid: ParsedRecord['pid']): string {
    if (!this._options.enable.pid) {
      return '';
    }

    const prefix = this._options.enable.name ? '/' : ' ';
    return `${prefix}${pid}`;
  }

  formatHostname(hostname: ParsedRecord['hostname']): string {
    if (!this._options.enable.hostname) {
      return '';
    }

    return [
      ' ',
      this._options.enable.name || this._options.enable.pid ? 'on ' : '',
      hostname,
    ].join('');
  }

  formatSource(source: ParsedRecord['source']): string {
    if (!this._options.enable.source || source === undefined) {
      return '';
    }

    const file = path.relative(this._options.basePath, source.file);
    const formattedSource = [
      ` (${file}:${source.line}`,
      source.func !== undefined ? ` in ${source.func}` : '',
      ')',
    ].join('');

    return chalk.green(formattedSource);
  }

  formatMessage(message: ParsedRecord['message']): string {
    if (!this.isSingleLine(message)) {
      return '';
    }

    return chalk.blue(` ${message}`);
  }

  formatExtras(extras: ParsedRecord['extras']): string {
    const entries = Object.entries(extras);
    if (entries.length === 0) {
      return '';
    }

    const formattedExtras = entries.map(([key, value]) => {
      if (
        typeof value === 'string' &&
        !this.containsWhitespace(value) &&
        value.length > 0
      ) {
        return `${key}=${value}`;
      }

      return `${key}=${JSON.stringify(value)}`;
    });

    return chalk.red(` (${formattedExtras.join(', ')})`);
  }

  formatDetails(
    message: ParsedRecord['message'],
    details: ParsedRecord['details'],
  ): string {
    const formattedDetails: string[] = [];
    if (!this.isSingleLine(message)) {
      formattedDetails.push(chalk.blue(this.indent(message, true)));
    }

    formattedDetails.push(
      ...Object.entries(details).map(([key, value]) =>
        chalk.cyan(
          this.indent(
            `${key}: ${stringify(value, {
              indent: this._options.jsonIndent,
              maxLength: 80,
            })}`,
            true,
          ),
        ),
      ),
    );

    const separator = this.indent('--', true);
    return `${formattedDetails.join(`\n${separator}\n`)}\n`;
  }

  isExtra(value: unknown): boolean {
    let stringifiedValue = JSON.stringify(value, undefined, 2);
    if (typeof value === 'string') {
      stringifiedValue = value;
    }

    return (
      this.isSingleLine(stringifiedValue) &&
      stringifiedValue.length <= this._options.extrasMaxValueLength
    );
  }

  isSingleLine(string: string): boolean {
    return !this._regex.newLine.test(string);
  }

  containsWhitespace(string: string): boolean {
    return this._regex.whitespace.test(string);
  }

  indent(input: string, leading = false): string {
    const indentation = ' '.repeat(this._options.indent);
    const prefix = leading ? indentation : '';
    const formatted = input
      .split(this._regex.newLine)
      .join(`${this._options.newLineCharacter}${indentation}`);

    return `${prefix}${formatted}`;
  }
}

export { ParsedRecord, Formatter };
