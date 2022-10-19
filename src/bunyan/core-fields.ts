/**
 * Bunyan core fields as defined by the [Core fields](
 * https://github.com/trentm/node-bunyan/tree/1.8.15#core-fields) documentation.
 */
const coreFields: readonly string[] = [
  'v',
  'level',
  'name',
  'hostname',
  'pid',
  'time',
  'msg',
  'src',
];

export default coreFields;
