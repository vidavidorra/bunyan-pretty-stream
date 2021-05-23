import BaseJoi from 'joi';

function isValid<T>(
  validation: BaseJoi.ValidationResult,
  value: unknown,
): value is T {
  return validation.error === undefined;
}

interface Joi extends BaseJoi.Root {
  isValid<T>(validation: BaseJoi.ValidationResult, value: unknown): value is T;
}

const joi: Joi = { ...BaseJoi, isValid };

export { joi, BaseJoi as Joi };
