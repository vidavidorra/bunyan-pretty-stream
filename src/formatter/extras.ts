import {type Options} from '../options.js';

class Extras {
  private readonly _formatCharacters: Options['extras']['formatCharacters'];
  constructor(formatCharacters: Options['extras']['formatCharacters']) {
    this._formatCharacters = formatCharacters;
  }

  format(extras: string[]) {
    if (extras.length === 0) {
      return '';
    }

    return [
      this._formatCharacters.start,
      extras.join(this._formatCharacters.separator),
      this._formatCharacters.end,
    ].join('');
  }
}

export default Extras;
