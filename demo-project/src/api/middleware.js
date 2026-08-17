/**
 * Express Middleware
 * Request logging, authentication, body validation, and error handling.
 */

const { verifyToken, extractBearerToken } = require('../auth/tokenHelper');
const { logger } = require('../utils/logger');

/**
 * Logs every incoming request.
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
  });
  next();
}

/**
 * Verifies the JWT Bearer token on protected routes.
 * Attaches decoded user payload to req.user.
 */
function authenticate(req, res, next) {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
}

/**
 * Validates that required fields are present in the request body.
 *
 * @param {string[]} fields - list of required field names
 */
function validateBody(fields) {
  return (req, res, next) => {
    const missing = fields.filter(f => req.body[f] === undefined || req.body[f] === '');
    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`
      });
    }
    next();
  };
}

/**
 * Global error handler — catches anything passed to next(err).
 */
function errorHandler(err, req, res, _next) {
  logger.error(`Unhandled error on ${req.method} ${req.path}: ${err.message}`);
  res.status(500).json({
    error: 'An unexpected error occurred'
  });
}

module.exports = {
  requestLogger,
  authenticate,
  validateBody,
  errorHandler
};
