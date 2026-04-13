// Centralized error handler to ensure consistent responses
function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Unexpected server error';
  // Avoid leaking internals in production
  const response = { message };
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }
  res.status(status).json(response);
}

module.exports = errorHandler;
