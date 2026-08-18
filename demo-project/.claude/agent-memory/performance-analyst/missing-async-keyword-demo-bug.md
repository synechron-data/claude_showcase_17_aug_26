---
name: missing-async-keyword-demo-bug
description: authService.js had a function using `await` without an `async` declaration — a parse-time SyntaxError, not a runtime bug. Check other service files for the same planted pattern.
metadata:
  type: feedback
---

`src/auth/authService.js`'s `refreshToken()` (pre-fix, lines 80-97) called `await getUserById(...)`
inside a function declared without `async`. This isn't a subtle runtime perf bug — it's a
SyntaxError at module parse time, so `require()`-ing the file throws immediately, which can
crash the whole server at startup rather than just failing the one route.

**Why this matters for future reviews:** per this repo's CLAUDE.md, "the codebase intentionally
contains bugs to showcase debugging/review workflows." This async/await mismatch is exactly the
shape of planted bug that's easy to skim past when reading a function's logic (the code *looks*
correct as async control flow) but breaks everything at load time. When auditing other files in
this repo (`src/auth/tokenHelper.js`, `src/api/middleware.js`, `src/api/routes.js`), specifically
grep for `await` and verify the enclosing function is declared `async` — don't assume it's fine
just because ESLint `require-await` would catch the *inverse* case (async with no await); it
won't catch this one.

**How to apply:** when reviewing any function performing async work in this repo, explicitly
check the function signature keyword, not just the presence of `await`.
