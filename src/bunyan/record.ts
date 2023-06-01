type Source = {
  file: string;
  line: number;
  func?: string;
};

type BunyanRecord = {
  [key: string]: unknown;
  v: number;
  level: number;
  name: string;
  hostname: string;
  pid: number;
  time: Date;
  msg: string;
  src?: Source | Record<string, never>;
};

export type {Source, BunyanRecord};
