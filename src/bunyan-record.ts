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

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
function isBunyanRecord(value: any): value is BunyanRecord {
  return (
    typeof value.v === 'number' &&
    typeof value.level === 'number' &&
    typeof value.name === 'string' &&
    typeof value.hostname === 'string' &&
    typeof value.pid === 'number' &&
    Object.prototype.toString.call(value.time) === '[object Date]' &&
    typeof value.msg === 'string' &&
    (value.src === undefined ||
      (typeof value.src === 'object' &&
        typeof value.src.file === 'string' &&
        typeof value.src.line === 'number' &&
        (value.src.func === undefined || typeof value.src.func === 'string')))
  );
}

export { BunyanRecord, coreFields, isBunyanRecord };
