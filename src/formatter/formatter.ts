import { BunyanRecord, coreFields } from '../bunyan-record';
import { Options, ParsedOptions, schema } from '../options';
import { Extras } from './extras';
import bunyan from 'bunyan';
import chalk from 'chalk';
import is from '@sindresorhus/is';
import moment from 'moment';
import path from 'path';
import stringify from 'json-stringify-pretty-compact';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitise(obj: any): any {
  Object.entries(obj).forEach(([key, value]) => {
    if (is.undefined(value)) {
      delete obj[key];
    } else if (is.object(value)) {
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
  extras: Extras;
  details: Record<string, unknown>;
}

class Formatter {
  private readonly _options: Readonly<ParsedOptions>;
  private readonly _regex = {
    newLine: /\r\n|\r|\n/,
    whitespace: /\s/,
  } as const;
  private readonly _internalOptions = {
    timeFormat: {
      short: 'HH:mm:ss.SSS',
      long: 'YYYY-MM-DD[T]HH:mm:ss.SSS',
    },
  } as const;
  private readonly _levels: Readonly<Record<number, string>>;

  constructor(options: Options) {
    const parsedOptions = schema.parse(options);
    parsedOptions.basePath = path.normalize(parsedOptions.basePath);
    this._options = parsedOptions;

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
      extras: new Extras(this._options.extras.maxLength),
      details: sanitise(record),
    };

    Object.keys(parsed.details).forEach((key) => {
      if (coreFields().includes(key)) {
        delete parsed.details[key];
      }
    });

    if (!this._options.show.extras) {
      return parsed;
    }

    const leftOvers = is.undefined(this._options.extras.key)
      ? parsed.details
      : parsed.details[this._options.extras.key];
    if (!is.nonEmptyObject(leftOvers)) {
      return parsed;
    }

    Object.entries(leftOvers).forEach(([key, value]) => {
      if (parsed.extras.parseAndAdd(key, value)) {
        delete leftOvers[key];
      }
    });

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
    if (!this._options.show.time) {
      return '';
    }

    let format = this._options.time.format;
    if (this._options.time.type === 'short') {
      format = this._internalOptions.timeFormat.short;
    } else if (this._options.time.type === 'long') {
      format = this._internalOptions.timeFormat.long;
    }

    if (!this._options.time.local) {
      time.utc();
      format = format.concat('[Z]');
    }

    return `[${time.format(format)}]`;
  }

  formatLevel(level: ParsedRecord['level']): string {
    const prefix = this._options.show.time ? ' ' : '';
    return `${prefix}${this._levels[level]}`;
  }

  formatName(name: ParsedRecord['name']): string {
    if (!this._options.show.name) {
      return '';
    }

    return ` ${name}`;
  }

  formatPid(pid: ParsedRecord['pid']): string {
    if (!this._options.show.pid) {
      return '';
    }

    const prefix = this._options.show.name ? '/' : ' ';
    return `${prefix}${pid}`;
  }

  formatHostname(hostname: ParsedRecord['hostname']): string {
    if (!this._options.show.hostname) {
      return '';
    }

    return [
      ' ',
      this._options.show.name || this._options.show.pid ? 'on ' : '',
      hostname,
    ].join('');
  }

  formatSource(source: ParsedRecord['source']): string {
    if (!this._options.show.source || is.undefined(source)) {
      return '';
    }

    const file = path.relative(this._options.basePath, source.file);
    const formattedSource = [
      ` (${file}:${source.line}`,
      !is.undefined(source.func) ? ` in ${source.func}` : '',
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
    const formattedExtras = extras.format();
    return formattedExtras.length === 0 ? '' : chalk.red(` ${formattedExtras}`);
  }

  formatDetails(
    message: ParsedRecord['message'],
    details: ParsedRecord['details'],
  ): string {
    const formatted: string[] = [];
    if (!this.isSingleLine(message)) {
      formatted.push(chalk.blue(this.indent(message, true)));
    }

    formatted.push(
      ...Object.entries(details).map(([key, value]) =>
        chalk.cyan(
          this.indent(
            `${key}: ${stringify(value, {
              indent: this._options.indent.json,
              maxLength: 80,
            })}`,
            true,
          ),
        ),
      ),
    );

    const separator = [
      this._options.newLineCharacter,
      this.indent('--', true),
      this._options.newLineCharacter,
    ].join('');
    const suffix = formatted.length > 0 ? this._options.newLineCharacter : '';
    return `${formatted.join(separator)}${suffix}`;
  }

  isSingleLine(string: string): boolean {
    return !this._regex.newLine.test(string);
  }

  containsWhitespace(string: string): boolean {
    return this._regex.whitespace.test(string);
  }

  indent(input: string, leading = false): string {
    const indentation = ' '.repeat(this._options.indent.details);
    const prefix = leading ? indentation : '';
    const formatted = input
      .split(this._regex.newLine)
      .join(`${this._options.newLineCharacter}${indentation}`);

    return `${prefix}${formatted}`;
  }
}

export { ParsedRecord, Formatter };