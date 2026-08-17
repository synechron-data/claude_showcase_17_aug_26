/**
 * Authentication Routes
 * Defines all /api/auth endpoints.
 */

const express = require('express');
const router = express.Router();
const { loginUser, refreshToken, revokeToken } = require('../auth/authService');
const { authenticate, validateBody } = require('./middleware');
const { validateEmail, validatePassword } = require('../utils/validators');
const { logger } = require('../utils/logger');

/**
 * POST /api/auth/login
 * Authenticates a user and returns access + refresh tokens.
 */
router.post('/login', validateBody(['email', 'password']), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters'
      });
    }

    // In a real app, fetch userRecord from database
    const mockUserRecord = {
      id: 'user-001',
      email,
      passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      role: 'user'
    };

    const result = await loginUser(email, password, mockUserRecord);

    res.json({
      message: 'Login successful',
      ...result
    });
  } catch (err) {
    if (err.message === 'Invalid credentials') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    next(err);
  }
});

/**
 * POST /api/auth/refresh
 * Issues a new access token from a valid refresh token.
 */
router.post('/refresh', validateBody(['refreshToken']), async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    const result = await refreshToken(token);
    res.json(result);
  } catch (err) {
    if (err.message.includes('Invalid') || err.message.includes('expired')) {
      return res.status(401).json({ error: err.message });
    }
    next(err);
  }
});

/**
 * POST /api/auth/logout
 * Revokes the refresh token, ending the session.
 */
router.post('/logout', authenticate, (req, res) => {
  const { refreshToken: token } = req.body;
  if (token) {
    revokeToken(token);
  }
  logger.info(`User logged out: ${req.user?.email}`);
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
