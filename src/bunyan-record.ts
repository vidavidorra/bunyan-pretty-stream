import is from '@sindresorhus/is';

interface BunyanCoreRecord {
  v: number;
  level: number;
  name: string;
  hostname: string;
  pid: number;
  time: Date;
  msg: string;
  src?: {
    file: string;
    line: number;
    func?: string;
  };
}

type BunyanRecord = BunyanCoreRecord & Record<string, unknown>;

function coreFields(): string[] {
  const record: Required<BunyanCoreRecord> = {
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

  return Object.keys(record);
}

function isBunyanRecord(value: unknown): value is BunyanRecord {
  return (
    is.plainObject(value) &&
    is.number(value.v) &&
    is.number(value.level) &&
    is.string(value.name) &&
    is.string(value.hostname) &&
    is.number(value.pid) &&
    is.date(value.time) &&
    is.string(value.msg) &&
    (is.undefined(value.src) ||
      (is.plainObject(value.src) &&
        is.number(value.src.line) &&
        (is.undefined(value.src.func) || is.string(value.src.func))))
  );
}

export { BunyanRecord, coreFields, isBunyanRecord };
