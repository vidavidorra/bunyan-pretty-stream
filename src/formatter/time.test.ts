import test from 'ava';
import {Settings} from 'luxon';
import type {Options} from '../options.js';
import Formatter from './time.js';

Settings.defaultLocale = 'en-GB';
Settings.defaultZone = 'Europe/Amsterdam';

function format(
  utc: boolean,
  preset: Options['time']['preset'],
  format?: string,
): string {
  return new Formatter({utc, preset, format}).format(
    new Date('2022-06-01T12:00Z'),
  );
}

test('formats to ISO 8601 in UTC with offset', (t) => {
  t.is(format(true, 'DATETIME_ISO_8601_OFFSET'), '2022-06-01T12:00:00.000Z');
});

test('formats to ISO 8601 in UTC without offset', (t) => {
  t.is(format(true, 'DATETIME_ISO_8601'), '2022-06-01T12:00:00.000');
});

test('formats to ISO 8601 in timezone with offset', (t) => {
  t.is(
    format(false, 'DATETIME_ISO_8601_OFFSET'),
    '2022-06-01T14:00:00.000+02:00',
  );
});

test('formats to ISO 8601 in timezone without offset', (t) => {
  t.is(format(false, 'DATETIME_ISO_8601'), '2022-06-01T14:00:00.000');
});

test('formats to ISO 8601 time in UTC with offset', (t) => {
  t.is(format(true, 'TIME_ISO_8601_OFFSET'), '12:00:00.000Z');
});

test('formats to ISO 8601 time in UTC without offset', (t) => {
  t.is(format(true, 'TIME_ISO_8601'), '12:00:00.000');
});

test('formats to ISO 8601 time in timezone with offset', (t) => {
  t.is(format(false, 'TIME_ISO_8601_OFFSET'), '14:00:00.000+02:00');
});

test('formats to ISO 8601 time in timezone without offset', (t) => {
  t.is(format(false, 'TIME_ISO_8601'), '14:00:00.000');
});

test('formats to Luxon preset time in timezone', (t) => {
  t.is(format(false, 'DATETIME_FULL'), '1 June 2022 at 14:00 CEST');
});

test('formats to specified format', (t) => {
  t.is(format(true, 'DATE_FULL', 'd LLLL, yyyy HH:mm'), '1 June, 2022 12:00');
});

test('throws an error for an unknown Luxon preset', (t) => {
  t.throws(() => format(true, 'unknown' as Options['time']['preset']), {
    instanceOf: Error,
    message: 'unknown Luxon preset',
  });
});
