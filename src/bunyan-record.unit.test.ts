import { BunyanRecord, coreFields, isBunyanRecord } from './bunyan-record';
import { describe, expect, it } from '@jest/globals';

describe('BunyanRecord', () => {
  describe('coreFields', () => {
    /**
     * Validate core fields according to Bunyan [Core fields](
     * https://github.com/trentm/node-bunyan/tree/1.8.15#core-fields).
     */
    it('returns an array of Bunyan core fields', () => {
      expect(Array.isArray(coreFields())).toEqual(true);
      expect(coreFields()).toEqual([
        'v',
        'level',
        'name',
        'hostname',
        'pid',
        'time',
        'msg',
        'src',
      ]);
    });
  });

  describe('isBunyanRecord', () => {
    const bunyanRecord: BunyanRecord = {
      v: 0,
      level: 0,
      name: '',
      hostname: '',
      pid: 0,
      time: new Date(0),
      msg: '',
      src: {
        file: '',
        line: 0,
        func: '',
      },
    };

    it('returns true for a record with all core fields', () => {
      expect(isBunyanRecord(bunyanRecord)).toEqual(true);
    });

    it("returns true for a record without 'src'", () => {
      const record = { ...bunyanRecord };
      delete record.src;

      expect(isBunyanRecord(record)).toEqual(true);
    });

    it.each(['v', 'level', 'name', 'hostname', 'pid', 'time', 'msg'])(
      "returns false for a record without '%s'",
      (property: string) => {
        const record = { ...bunyanRecord };
        delete record[property];

        expect(isBunyanRecord(record)).toEqual(false);
      },
    );

    it('returns true if the input contains non-core fields', () => {
      const record = { ...bunyanRecord, nonCoreField: '' };

      expect(isBunyanRecord(record)).toEqual(true);
    });

    it("narrows the type to 'BunyanRecord'", () => {
      const record: unknown = { ...bunyanRecord };

      if (isBunyanRecord(record)) {
        expect(record.name).toEqual(bunyanRecord.name);
      }
    });
  });
});
