import { Joi, joi } from './joi';
import { describe, expect, it } from '@jest/globals';
import is from '@sindresorhus/is';

describe('isValid', () => {
  it('is a function', () => {
    expect(is.function_(joi.isValid)).toEqual(true);
  });

  it('returns true when there are no validation errors', () => {
    expect(joi.isValid({ value: {}, error: undefined }, null)).toEqual(true);
  });

  it('returns false when there are validation errors', () => {
    expect(
      joi.isValid(
        {
          value: {},
          error: new joi.ValidationError('test error', null, null),
        },
        null,
      ),
    ).toEqual(false);
  });

  it('narrows the value type', () => {
    const quote =
      'Beneath this mask there is an idea. And ideas are bulletproof.';
    const validation: Readonly<Joi.ValidationResult> = {
      value: { quote },
      error: undefined,
    };

    expect(joi.isValid(validation, null)).toEqual(true);
    if (joi.isValid<{ quote: string }>(validation, validation.value)) {
      expect(validation.value.quote).toEqual(quote);
    }
  });
});
