# CLAUDE.md — src/utils

Scope: this directory only. See the repo root `CLAUDE.md` for project-wide conventions (coding standards, error handling, PR/git rules) — those still apply here.

## Contents

- `validators.js` — pure, stateless input validators (email, password, phone, UUID) and `sanitizeString`. No I/O, no imports from elsewhere in the app.
- `logger.js` — minimal structured JSON logger (stdout for info/warn/debug, stderr for error), level-gated by the `LOG_LEVEL` env var. Not a real observability stack; do not extend it into one — swap it for Winston/Pino/etc. if that's ever needed.

## Conventions specific to this directory

- **Validators return a single composed expression** — no early-return guard clauses (e.g. `typeof x === 'string' && regex.test(x)`, not `if (!x) return false;`). This is a stricter version of the root CLAUDE.md rule and is enforced here specifically because ESLint's `curly` rule rejects bare-statement `if`s, and a composed expression sidesteps that entirely.
- Every exported validator must have a matching test in `tests/utils/validators.test.js` covering: valid input, invalid input, and non-string input.
- Do not add I/O, env reads, or app-specific imports to `validators.js` — it must stay pure and dependency-free so it can be reused/tested in isolation.
- `logger.js` is the only place allowed to write to stdout/stderr directly; everywhere else in the app must go through `logger`, never raw `console.log`.
