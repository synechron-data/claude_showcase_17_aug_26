---
name: bcryptjs-pure-js-cpu-cost
description: Project uses `bcryptjs` (pure JS, no native bindings) not `bcrypt` — compare/hash cost runs on the main thread in chunks, not offloaded to libuv threadpool.
metadata:
  type: feedback
---

`package.json` depends on `bcryptjs` (^2.4.3), used in `src/auth/authService.js` (`bcrypt.compare`, `bcrypt.hash` in tests). Unlike the native `bcrypt` package, `bcryptjs` has no C++ bindings — its async API yields periodically via `setImmediate` but the actual hashing work still executes on Node's single main thread, not a worker/threadpool.

**Why:** This means CPU cost from `bcrypt.compare`/`hash` calls contends directly with the event loop and all other request handling, at any call volume — it's a genuine per-request cost, not a free background operation. It matters for concurrent login/hash load (many simultaneous requests can degrade overall server responsiveness), but it is a pre-existing architectural characteristic of this dependency choice, not something introduced by any particular PR's `await` correctness fix. Don't flag `await bcrypt.compare(...)` itself as a new perf regression — the CPU work already happened whether or not the promise was awaited; awaiting just makes the response latency honestly reflect it.

**How to apply:** When reviewing any PR touching `authService.js` login/hash paths under a "does this add latency/blocking" framing, note that the underlying CPU cost is constant and pre-existing (rounds=10 salt factor). Only flag as a genuine new finding if: (a) salt rounds increase, (b) hash/compare is added in a new hot-path loop, or (c) call volume assumptions materially changed (e.g. batch operations). For true concurrency/throughput improvements, the fix would be migrating to the native `bcrypt` package (worker-thread offload) or moving hashing to a queue/worker process — worth suggesting only if the PR is specifically about login scalability.

Related: [[unbounded-refresh-token-store]] (same file, different perf concern).
