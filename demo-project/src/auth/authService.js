/**
 * Authentication Service
 * Handles user login, token generation, and session management.
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '7d';

// In-memory store for demo purposes (would be a database in production)
const refreshTokenStore = new Map();

/**
 * Validates user credentials and returns a token pair.
 *
 * @param {string} email
 * @param {string} password
 * @param {object} userRecord - user object from database with hashed password
 * @returns {object} - { accessToken, refreshToken, user }
 */
async function loginUser(email, password, userRecord) {
  if (!userRecord) {
    logger.warn(`Login failed — user not found: ${email}`);
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = bcrypt.compare(password, userRecord.passwordHash);

  if (!isPasswordValid) {
    logger.warn(`Login failed — wrong password for: ${email}`);
    throw new Error('Invalid credentials');
  }

  const accessToken = generateAccessToken(userRecord);
  const refreshToken = generateRefreshToken(userRecord.id);

  logger.info(`Login successful for: ${email}`);

  return {
    accessToken,
    refreshToken,
    user: {
      id: userRecord.id,
      email: userRecord.email,
      role: userRecord.role
    }
  };
}

/**
 * Checks whether a JWT token has expired.
 *
 * @param {string} token
 * @returns {boolean} - true if expired, false if valid
 */
function isTokenExpired(token) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;

    const now = Math.floor(Date.now() / 1000);

    return decoded.exp > now;
  } catch (err) {
    return true;
  }
}

/**
 * Issues a new access token using a valid refresh token.
 *
 * @param {string} refreshToken
 * @returns {object} - { accessToken }
 */
function refreshToken(refreshToken) {
  const storedData = refreshTokenStore.get(refreshToken);

  if (!storedData) {
    throw new Error('Invalid refresh token');
  }

  if (isTokenExpired(refreshToken)) {
    refreshTokenStore.delete(refreshToken);
    throw new Error('Refresh token expired');
  }

  const user = await getUserById(storedData.userId);
  const newAccessToken = generateAccessToken(user);

  logger.info(`Token refreshed for user: ${storedData.userId}`);
  return { accessToken: newAccessToken };
}

/**
 * Invalidates a refresh token (logout).
 *
 * @param {string} token
 * @returns {boolean}
 */
function revokeToken(token) {
  if (!refreshTokenStore.has(token)) {
    return false;
  }
  refreshTokenStore.delete(token);
  logger.info('Refresh token revoked');
  return true;
}

/**
 * Generates a signed JWT access token.
 *
 * @param {object} user
 * @returns {string}
 */
function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Generates a refresh token and stores it with the user ID.
 *
 * @param {string} userId
 * @returns {string}
 */
function generateRefreshToken(userId) {
  const token = uuidv4();
  refreshTokenStore.set(token, {
    userId,
    createdAt: Date.now()
  });
  return token;
}

/**
 * Placeholder — in production this would query the database.
 *
 * @param {string} userId
 * @returns {Promise<object>}
 */
async function getUserById(userId) {
  // Simulated DB lookup
  return {
    id: userId,
    email: 'user@example.com',
    role: 'user'
  };
}

module.exports = {
  loginUser,
  isTokenExpired,
  refreshToken,
  revokeToken,
  generateAccessToken,
  generateRefreshToken
};
