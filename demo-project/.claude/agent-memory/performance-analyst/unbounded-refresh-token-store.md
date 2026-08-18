---
name: unbounded-refresh-token-store
description: authService.js refreshTokenStore (in-memory Map) has no TTL sweep or size cap — grows with total historical logins, not active sessions.
metadata:
  type: feedback
---

`src/auth/authService.js` keeps refresh tokens in a module-level `Map` (`refreshTokenStore`). Entries are only removed via explicit `revokeToken`/logout, or lazily when a client happens to present that exact expired token again to `refreshToken()`. Tokens belonging to users who never log out or never retry a refresh stay in the Map forever — unbounded heap growth proportional to cumulative logins, not concurrent sessions.

**Why:** CLAUDE.md documents this Map as an intentional stand-in for a real DB/session store (resets on restart, not shared across processes) — that part is expected/by design for the demo. But the *lack of any eviction or TTL sweep* is a separate, genuine performance gap that isn't called out anywhere in the docs, so it's easy to wave off as "just the demo simplification" and skip flagging it. It's worth flagging every time until a sweep/cap or a real TTL-backed store (e.g. Redis) is added.

**How to apply:** When reviewing `authService.js` (or any future replacement session store), check whether an eviction mechanism exists before treating the in-memory Map as merely a demo limitation. If none exists, flag as High: unbounded in-memory collection with no eviction/size cap. Suggested fix is a periodic `setInterval` sweep using `jwt.decode(token).exp` to prune expired entries, or a hard cap with LRU eviction.

Related: [[missing-async-keyword-demo-bug]] (different bug in the same function area, `refreshToken()` in this file — that one is a correctness/syntax bug, not performance, don't conflate the two).
