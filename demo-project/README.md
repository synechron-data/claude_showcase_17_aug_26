# Demo Project — Authentication API

A Node.js/Express authentication API used as a live demo project for the
**Claude Code Capabilities Session**.

This project is intentionally structured to showcase every Claude Code feature:
CLAUDE.md, slash commands, skills, hooks, plugins, and MCP integration.

---

## Project Structure

```
demo-project/
├── src/
│   ├── auth/
│   │   ├── authService.js     ← Core auth logic (contains demo bugs)
│   │   └── tokenHelper.js     ← JWT utilities
│   ├── api/
│   │   ├── routes.js          ← Express route definitions
│   │   └── middleware.js      ← Auth, logging, error handling
│   └── utils/
│       ├── validators.js      ← Input validation helpers
│       └── logger.js          ← Structured JSON logger
└── .env.example               ← Environment variable template
```

---

## API Endpoints

| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/login` | Login with email + password | No |
| POST | `/api/auth/refresh` | Get new access token | No |
| POST | `/api/auth/logout` | Revoke refresh token | Yes |
| GET | `/api/auth/me` | Get current user profile | Yes |
| GET | `/health` | Health check | No |

---

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run tests
npm test

# Start development server
npm run dev
```