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
