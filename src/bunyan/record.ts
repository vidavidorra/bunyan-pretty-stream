type BunyanRecord = {
  [key: string]: unknown;
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
};

export default BunyanRecord;
