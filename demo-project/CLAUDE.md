# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Node.js/Express JWT authentication API. Built as a live demo project for a Claude Code capabilities session — it intentionally contains bugs to showcase debugging, review, and fix workflows. Do not assume unexpected behavior is accidental; it may be a planted demo bug.

## Commands

```bash
npm run dev         # Start with nodemon (development)
npm start           # Start server (production mode)
npm test            # Run Jest with coverage (coverage collected from src/**/*.js)
npm run test:watch  # Jest in watch mode
npm test -- path/to/file.test.js           # Run a single test file
npm test -- -t "test name pattern"         # Run tests matching name
npm run lint        # ESLint over src/ and tests/
npm run lint:fix    # ESLint autofix
```

Run a single test file: `npx jest path/to/file.test.js`
Run a single test by name: `npx jest -t "test name pattern"`

There is no build step — the server runs directly from `src/index.js` via Node.

## Tech Stack

- Runtime: Node.js 20
- Framework: Express.js
- Database: PostgreSQL with Prisma ORM
- Testing: Jest
- Language: ECMAScript 2022 for all new code only

## Architecture

Request flow: `src/index.js` wires Express with `requestLogger` middleware globally, mounts all auth endpoints under `/api/auth` from `src/api/routes.js`, and registers `errorHandler` last as the global error middleware.

Layering:

- `src/api/routes.js` — route handlers only; validates input shape, calls into `authService`, maps thrown errors to HTTP status codes (e.g. `'Invalid credentials'` → 401). It does NOT talk to `tokenHelper.js` directly.
- `src/api/middleware.js` — cross-cutting concerns: `requestLogger`, `authenticate` (verifies Bearer token via `tokenHelper.verifyToken`, attaches `req.user`), `validateBody` (checks required fields present), `errorHandler` (catch-all, returns generic 500).
- `src/auth/authService.js` — business logic: `loginUser`, `refreshToken`, `revokeToken`, token generation. Owns the in-memory `refreshTokenStore` (a `Map`, standing in for a database — resets on every restart, not shared across processes).
- `src/auth/tokenHelper.js` — low-level JWT primitives: `verifyToken` (signature + expiry check, throws typed errors), `decodeToken` (no verification, for reading claims only), `extractBearerToken`, `getTokenTTL`. `authService.js` and `middleware.js` both depend on this; it depends on nothing else in the app.
- `src/utils/validators.js` — pure, stateless input validators (email, password, UUID, sanitization). No I/O.
- `src/utils/logger.js` — minimal structured JSON logger (stdout/stderr), level-gated by `LOG_LEVEL` env var. Not a real observability stack (see README).

There's no real user database: `routes.js` builds a `mockUserRecord` inline for login, and `authService.getUserById` returns a hardcoded stub — expect these to be replaced with real persistence rather than extended in place.

JWT config (`JWT_SECRET`, `JWT_EXPIRES_IN`, `REFRESH_EXPIRES_IN`) is read from env vars in both `authService.js` and `tokenHelper.js` independently, each with its own fallback default — keep them in sync if changing defaults.

### Request flow (login example)

`POST /api/auth/login` → `validateBody(['email','password'])` → route handler validates format via `validators.js` → `authService.loginUser()` checks bcrypt hash, calls `generateAccessToken` (signed JWT) + `generateRefreshToken` (uuid stored in `refreshTokenStore`) → returns `{ accessToken, refreshToken, user }`. Protected routes (`/logout`, `/me`) go through `authenticate` middleware, which calls `tokenHelper.verifyToken` and attaches the decoded payload to `req.user`.

### Error convention

Route handlers translate known domain errors to HTTP status codes inline (e.g. `'Invalid credentials'` → 401) and pass everything else to `next(err)`, where `errorHandler` logs it and returns a generic 500. Preserve this pattern when adding routes — don't leak internal error messages to clients from the global handler.

### Token model

Two-token scheme: short-lived signed JWT access token (claims: `sub`, `email`, `role`) + opaque UUID refresh token stored server-side in `refreshTokenStore` with `{ userId, createdAt }`. Refresh tokens are revoked by deleting the map entry (`revokeToken`, logout).

## Coding Standards

- Always use async/await, never raw Promises
- All functions must have JSDoc comments
- No console.log in production code — use the logger utility
- Every new function must have at least one unit test
- Pure validation functions use a single return statement with a composed expression
- Never use multiple early-return guard clauses in validator functions

## Repository conventions

- CommonJS (`require`/`module.exports`) throughout, not ESM.
- ESLint enforces: `eqeqeq` (always `===`), `curly`, `no-var`/`prefer-const`, `no-return-await`, `require-await` (no `async` functions without an `await`), unused-arg exception for `_`-prefixed names.
- `.claude/settings.json` denies reads of `.env*`, `secrets/**`, and `credentials*` — don't try to work around this to inspect real secrets.

## What Claude Must Never Do

- Never modify .env or .env.\* files
- Never push directly to main branch
- Never remove existing tests
- Never install packages without confirming with the developer

## PR and Git Standards

- Commit messages follow Conventional Commits: feat:, fix:, docs:, test:
- PR descriptions must include: what changed, why it changed, how to test
