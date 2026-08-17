/**
 * Token Helper Utilities
 * Low-level functions for JWT parsing, validation, and extraction.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

/**
 * Verifies a JWT token and returns the decoded payload.
 *
 * @param {string} token
 * @returns {object} decoded payload
 * @throws {Error} if token is invalid or expired
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (err.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw err;
  }
}

/**
 * Decodes a JWT token without verifying the signature.
 * Use only for reading non-sensitive claims.
 *
 * @param {string} token
 * @returns {object|null}
 */
function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
}

/**
 * Extracts the Bearer token from an Authorization header.
 *
 * @param {string} authHeader - e.g. "Bearer eyJhbGci..."
 * @returns {string|null}
 */
function extractBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Returns the remaining lifetime of a token in seconds.
 * Returns 0 if the token is expired or invalid.
 *
 * @param {string} token
 * @returns {number}
 */
function getTokenTTL(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return 0;
  const remaining = decoded.exp - Math.floor(Date.now() / 1000);
  return Math.max(0, remaining);
}

module.exports = {
  verifyToken,
  decodeToken,
  extractBearerToken,
  getTokenTTL
};
