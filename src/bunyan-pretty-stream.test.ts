import test from 'ava';
import {PrettyStream} from './bunyan-pretty-stream.js';

const formatsStream = test.macro<[string, boolean]>({
  async exec(t, version, raw) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {createLogger} = await import(`bunyan-${version}`);
    t.true(createLogger !== undefined);

    const stream = new PrettyStream();
    let data = '';
    stream.on('data', (chunk) => {
      data = typeof chunk === 'string' ? chunk : '';
    });

    const type = raw ? 'raw' : undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    createLogger({name: 'test', streams: [{stream, type}]}).info('stream');
    t.regex(data, /stream/);
  },
  title(_, version, raw) {
    return `bunyan@${version} formats a ${raw ? 'raw ' : ''}stream`;
  },
});

test(formatsStream, '1.x', false);
test(formatsStream, '2.x', false);
test(formatsStream, '1.x', true);
test(formatsStream, '2.x', true);

test('returns an error when transforming an invalid object', (t) => {
  t.plan(1);
  new PrettyStream()._transform({}, 'binary', (error) => {
    t.deepEqual(error, new Error('data MUST be a valid bunyan record'));
  });
});
