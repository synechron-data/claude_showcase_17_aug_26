---
name: demo-project-planted-bugs
description: This is a demo repo with intentionally planted bugs (per CLAUDE.md); ESLint parse errors can mask other lint findings, and refresh tokens are UUIDs not JWTs so JWT-decode-based checks silently misbehave on them.
metadata:
  type: project
---

CLAUDE.md states this repo "intentionally contains bugs to showcase debugging,
review, and fix workflows" — unexpected behavior should not be assumed
accidental. When auditing, expect deliberately-planted issues like missing
`async`/`await`, inverted boolean logic, and shadowed parameter names, not just
incidental style nits.

**Technique — unmasking lint errors hidden behind a parse error:** if a file
has a syntax error (e.g. `await` used in a non-async function), `npx eslint`
stops at the parse error and reports nothing else. To see the *rest* of the
file's lint issues, copy the file to the scratchpad, apply the minimal fix
(e.g. add `async`), and re-run eslint on the copy — do not edit the real file
just to lint it. This surfaced `no-unused-vars`, `require-await`, and `curly`
violations in `src/auth/authService.js` that were otherwise invisible.

**Codebase-specific gotcha — token type mismatch:** `authService.js`'s
`generateRefreshToken` produces an opaque `uuidv4()` string, not a JWT
(architecture doc in CLAUDE.md confirms: refresh tokens are "opaque UUID"
stored server-side). `authService.isTokenExpired` internally calls
`jwt.decode(token)`, which returns `null` for any non-JWT string. So calling
`isTokenExpired` on a refresh token always takes the `!decoded` early-return
branch — the result is effectively constant regardless of the token's actual
freshness. Any future function that runs `jwt.decode`/`jwt.verify` against a
refresh token (as opposed to an access token) is suspect for this same
mismatch — check which token type is actually being passed in before trusting
JWT-shaped expiry/verification logic. Related: [[duplicated-expiry-check-logic]]
if that note exists — `tokenHelper.js` already owns JWT verification/expiry
and `authService.js` should delegate to it rather than re-implementing it.
