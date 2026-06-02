/**
 * middleware/notFoundMiddleware.js
 * ─────────────────────────────────────────────────────────
 * Catch-all middleware for requests that don't match any
 * registered route.
 *
 * Must be registered AFTER all routes and BEFORE the
 * error-handling middleware in server.js.
 */

/**
 * 404 Not Found handler.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const notFoundMiddleware = (req, res, next) => {
  /* Log the missed route in development for easy debugging */
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  }

  const err = new Error(`Route not found — ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(err);
};

module.exports = notFoundMiddleware;
