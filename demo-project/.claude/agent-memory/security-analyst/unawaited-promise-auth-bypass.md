---
name: unawaited-promise-auth-bypass
description: Auth-path bugs in this repo cluster as truthiness errors (unawaited bcrypt.compare, inverted expiry comparison); authService.js also has a hard SyntaxError so it cannot be required at runtime
metadata:
  type: feedback
---

When auditing `src/auth/` in this repo, check boolean-producing security predicates for
truthiness bugs before anything else — that is where the real vulnerabilities are, not in
injection or crypto choice.

Confirmed instances (2026-08-18 audit of `src/auth/authService.js`):
- `bcrypt.compare(...)` called without `await`, result used in `if (!isPasswordValid)`.
  A pending Promise is always truthy, so the negation is always false and every password
  is accepted. Full pre-auth bypass.
- `isTokenExpired()` returns `decoded.exp > now` — inverted. Expired tokens report
  "not expired", valid tokens report "expired".
- `REFRESH_EXPIRES_IN` is read from env but never referenced; refresh tokens in the
  in-memory `Map` have no expiry enforcement at all.

**Why:** These read as correct on a skim — the function names, JSDoc, and control flow all
describe the right behaviour, and the bug is a single missing keyword or flipped operator.
ESLint's `require-await` does not catch a missing `await` on a call inside a non-async
context, and there is no test coverage on this module (see below), so nothing flags them.

**How to apply:** On any audit touching auth, grep for `bcrypt.compare`, `bcrypt.compareSync`,
`verify`, and any `is*Expired`/`is*Valid` helper, and read the call site's truthiness check
rather than the function body. Also verify every declared token-lifetime constant is actually
consumed somewhere.

**Runtime verification caveat:** `src/auth/authService.js` currently has `await` inside the
non-async `function refreshToken()` (~line 92), which is a parse-time SyntaxError. The module
cannot be `require()`d, so dynamic testing, `npm test`, and coverage all fail on it. To
reproduce findings at runtime, copy the file to the scratchpad and add the missing `async`
first — do not conclude the code is unreachable or unused just because it will not load.

Note: root `CLAUDE.md` says planted bugs are intentional for a demo. Still report them as
findings; the demo framing is not a reason to downgrade severity.
