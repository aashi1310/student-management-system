/**
 * middleware/errorMiddleware.js
 * ─────────────────────────────────────────────────────────
 * Centralised error-handling middleware for Express.
 *
 * Must be registered AFTER all routes in server.js
 * (Express identifies error handlers by their 4-argument signature).
 *
 * Catches all errors forwarded via next(err) or thrown inside
 * async route handlers, and returns a consistent JSON response.
 */

/**
 * Global error handler middleware.
 *
 * @param {Error}            err  - The error object
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const errorMiddleware = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  /* Log the full stack trace in development for easier debugging */
  if (process.env.NODE_ENV !== 'production') {
    console.error('─── Error ───────────────────────────────────');
    console.error(`${err.name}: ${err.message}`);
    if (err.stack) console.error(err.stack);
    console.error('─────────────────────────────────────────────');
  }

  /* Use the status code already set on the response (by a previous
     middleware / controller), or fall back to 500 */
  let statusCode = res.statusCode && res.statusCode !== 200
    ? res.statusCode
    : 500;

  let message = err.message || 'Internal Server Error';

  /* ── Mongoose: document not found by id ── */
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message    = 'Invalid resource identifier format';
  }

  /* ── Mongoose: schema validation failure ── */
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join('. ');
  }

  /* ── MongoDB: unique index violation ── */
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value — a student with this ${field} already exists`;
  }

  /* ── JSON parse error (malformed request body) ── */
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message    = 'Invalid JSON in request body';
  }

  return res.status(statusCode).json({
    success: false,
    message,
    /* Include the stack trace only in development builds */
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
