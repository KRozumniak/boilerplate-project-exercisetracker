export class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function buildError({ statusCode = 400, message }) {
  const error = {
    message,
    statusCode: statusCode,
  };
  console.error(error);
  return error;
}

export function throwError(message, statusCode) {
  throw new CustomError(message, statusCode);
}
