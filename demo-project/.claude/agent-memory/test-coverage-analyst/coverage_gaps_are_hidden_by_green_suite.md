---
name: coverage-gaps-hidden-by-green-suite
description: In this repo, `npm test` can pass 100% while entire src files (e.g. authService.js) have zero test files and even fail to require() due to syntax errors
metadata:
  type: feedback
---

`npm test` passing (all green) in this repo does NOT mean the code is sound — a file can have
zero corresponding test file, and even a fatal SyntaxError that crashes on `require()`, while the
suite still reports 100% pass because nothing imports that file.

**Why:** Found `src/auth/authService.js` had no test file at all under `tests/` (only
`tests/utils/validators.test.js` existed) and running `node -e "require('./src/auth/authService.js')"`
threw `SyntaxError: await is only valid in async functions` (from `refreshToken()` using `await`
without being declared `async`, line ~80-92). Jest coverage run reported 0/0/0/0% for the file with no
failing test to flag it, because nothing exercised the module at all. Static reading of the file alone
would have made this look like a "missing await" logic bug rather than a fatal, app-breaking parse
error — routes.js requires authService.js directly, so this crashes the whole app at startup.

**How to apply:** For this repo specifically, always try to actually `require()`/load each source
file under review (or run its test file if one exists) before concluding coverage is "just thin" —
don't rely on `npm test` exit code or static reading alone. Per-file 0% coverage plus "all tests
passed" is a red flag combination worth calling out as Critical, not just "no tests."

**Confirmed still present as of 2026-08-18** (same commit range, `tests/` still only has `tests/utils/`,
no `tests/auth/`): the `refreshToken()` missing-`async` SyntaxError is unchanged at line ~92. Two more
planted bugs in `authService.js` surfaced on this pass, both invisible to static skim and both exactly
the kind of thing a "test that should exist" would catch:
- `loginUser()` line 32: `const isPasswordValid = bcrypt.compare(...)` — missing `await`. `isPasswordValid`
  is a pending Promise object, always truthy, so `if (!isPasswordValid)` never rejects a wrong password.
  Login accepts *any* password once a `userRecord` exists. Would only ever be caught by a test that
  actually awaits `loginUser()` with a deliberately wrong password and asserts rejection.
- `isTokenExpired()` line 68: `return decoded.exp > now;` — inverted. `exp > now` means the token is
  still valid, but the function is documented/named to return `true` when expired. Every call site
  (`refreshToken()`) inherits the inversion: valid tokens get treated as expired and expired tokens as
  valid. Only a test with a real signed JWT of known future/past `exp` would catch this.
