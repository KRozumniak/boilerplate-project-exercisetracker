export const errorHandlerMiddleware = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.message = error.message || 'Internal server error';
  console.error(error);
  res.status(error.statusCode).json({
    statusCode: error.statusCode,
    message: error.message,
  });
};
