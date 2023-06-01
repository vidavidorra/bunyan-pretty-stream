import {relative} from 'node:path';
import bunyan from 'bunyan';
import chalk, {type ChalkInstance as Chalk} from 'chalk';
import stringify from 'json-stringify-pretty-compact';
import {type BunyanRecord} from '../bunyan/index.js';
import {type PublicOptions, type Options, schema} from '../options.js';
import Parser, {type ParsedRecord} from '../parser/parser.js';
import normalisePath from '../helpers/normalise-path.js';
import Extras from './extras.js';
import Time from './time.js';

class Formatter {
  private readonly _options: Readonly<Options>;
  private readonly _parser: Parser;
  private readonly _extras: Extras;
  private readonly _time: Time;
  private readonly _newLineRegex: RegExp;
  private readonly _levels: Readonly<Record<number, string>>;

  constructor(options: PublicOptions) {
    this._options = schema.parse(options);
    this._parser = new Parser({
      show: this._options.show.extras,
      extras: this._options.extras,
    });
    this._extras = new Extras(this._options.extras.formatCharacters);
    this._time = new Time(this._options.time);
    this._newLineRegex = /\r\n|\r|\n/;
    this._levels = {
      [bunyan.levelFromName.trace]: chalk.gray('TRACE'),
      [bunyan.levelFromName.debug]: chalk.blue('DEBUG'),
      [bunyan.levelFromName.info]: chalk.green(' INFO'),
      [bunyan.levelFromName.warn]: chalk.magenta(' WARN'),
      [bunyan.levelFromName.error]: chalk.red('ERROR'),
      [bunyan.levelFromName.fatal]: chalk.bgRed('FATAL'),
    };
  }

  format(record: BunyanRecord): string {
    const parsedRecord = this._parser.parse(structuredClone(record));

    return [
      this.formatTime(parsedRecord.time),
      this.formatLevel(parsedRecord.level),
      ':',
      this.formatName(parsedRecord.name),
      this.formatPid(parsedRecord.pid),
      this.formatHostname(parsedRecord.hostname),
      this.formatSource(parsedRecord.source, chalk.green),
      this.formatMessage(parsedRecord.message, chalk.blue),
      this.formatExtras(parsedRecord.extras, chalk.red),
      this._options.newLineCharacter,
      this.formatDetails(parsedRecord.message, parsedRecord.details),
    ].join('');
  }

  formatTime(time: ParsedRecord['time']): string {
    return this._options.show.time ? `[${this._time.format(time)}]` : '';
  }

  formatLevel(level: ParsedRecord['level']): string {
    const prefix = this._options.show.time ? ' ' : '';
    return `${prefix}${this._levels[level]}`;
  }

  formatName(name: ParsedRecord['name']): string {
    return this._options.show.name ? ` ${name}` : '';
  }

  formatPid(pid: ParsedRecord['pid']): string {
    return this._options.show.pid
      ? `${this._options.show.name ? '/' : ' '}${pid}`
      : '';
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

  formatSource(source: ParsedRecord['source'], colour: Chalk): string {
    if (!this._options.show.source || source === undefined) {
      return '';
    }

    const file = relative(this._options.basePath, normalisePath(source.file));
    const formattedSource = [
      ` (${file}:${source.line}`,
      source.func === undefined ? '' : ` in ${source.func}`,
      ')',
    ].join('');

    return colour(formattedSource);
  }

  formatMessage(message: ParsedRecord['message'], colour: Chalk): string {
    return this._newLineRegex.test(message) ? '' : colour(` ${message}`);
  }

  formatExtras(extras: string[], colour: Chalk): string {
    const formattedExtras = this._extras.format(extras);
    return formattedExtras.length === 0 ? '' : colour(` ${formattedExtras}`);
  }

  formatDetails(
    message: ParsedRecord['message'],
    details: ParsedRecord['details'],
  ): string {
    const formatted: string[] = [];
    if (this._newLineRegex.test(message)) {
      formatted.push(chalk.blue(this.indent(message)));
    }

    formatted.push(
      ...Object.entries(details).map(([key, value]) =>
        chalk.cyan(
          this.indent(
            `${key}: ${stringify(value, {
              indent: this._options.indent.json,
              maxLength: 80,
            })}`,
          ),
        ),
      ),
    );

    const suffix = formatted.length > 0 ? this._options.newLineCharacter : '';
    return `${formatted.join(this._options.newLineCharacter)}${suffix}`;
  }

  private indent(input: string): string {
    const indentation = ' '.repeat(this._options.indent.details);
    const formatted = input
      .split(this._newLineRegex)
      .join(`${this._options.newLineCharacter}${indentation}`);

    return `${indentation}${formatted}`;
  }
}

export {Formatter};
