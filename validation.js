import { getFormattedCurrentDate } from './utils/utils.js';
import { buildError } from './utils/error-utils.js';

export function isDateValid(value) {
  const expectedDateStringLength = 10;
  if (!isNaN(new Date(value)) && value.length === expectedDateStringLength) {
    return true;
  }
  return false;
}

export function isIntegerValid(value) {
  if (!value || !value.trim().length) {
    return false;
  }

  const number = Number(value);
  if (Number.isNaN(number) || number < 0) {
    return false;
  }
  return true;
}

export function isUserIdValid(value) {
  return isIntegerValid(value);
}

export function isDurationValid(value) {
  return isIntegerValid(value);
}

export function isLimitQueryParamValid(value) {
  return isIntegerValid(value);
}

export function isDateQueryParamValid(value) {
  return isDateValid(value);
}

export function isUsernameValid(username) {
  if (!username || !username.trim().length) {
    return false;
  }
  return true;
}

export function isDescriptionValid(value) {
  if (typeof value === 'string' && !!value.trim().length && value) {
    return true;
  }
  return false;
}

export function getValidatedInputs({ userId, duration, description, date }) {
  const errors = [];

  if (!isUserIdValid(userId)) {
    const error = buildError({
      message: 'Invalid user id',
    });
    errors.push(error);
  }

  if (!isDurationValid(duration)) {
    const error = buildError({
      message: 'Invalid duration',
    });
    errors.push(error);
  }

  if (!isDescriptionValid(description)) {
    const error = buildError({
      message: 'Invalid description',
    });
    errors.push(error);
  }

  if (date) {
    if (!isDateValid(date)) {
      const error = buildError({
        message: 'Invalid date',
      });
      errors.push(error);
    }
  } else {
    date = getFormattedCurrentDate();
  }

  if (errors.length) {
    const errorsMessage = errors
      .map((e) => {
        return e.message;
      })
      .join('. ');
    const error = buildError({
      message: errorsMessage,
    });
    return { error };
  }

  return {
    userId,
    duration,
    description,
    date,
  };
}
