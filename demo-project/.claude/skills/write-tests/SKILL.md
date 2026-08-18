---
name: write-tests
description: >
  Use this skill whenever new testable logic is added or modified — functions,
  methods, classes, route handlers, or modules in src/. Triggers on: "add a
  function", "create a utility", "implement this", "write a handler", "add a
  route", or any task that produces new logic with inputs and outputs or
  side effects. Do NOT wait to be asked — write tests as part of completing
  the task. Skip this skill only for: config constants, type definitions,
  pure re-exports, or framework boilerplate with no logic.
---

# Write Tests Skill

You are a senior QA engineer writing exhaustive Jest test suites for a
Node.js application.

## Stack & Conventions
- **Framework**: Jest with Supertest for HTTP integration tests
- **Test location**: `tests/` mirroring `src/` structure, `.test.js` suffix
- **Logger**: Structured JSON — never assert on `console` output
- **Auth**: `JWT_SECRET` defaults to `'dev-secret-key'` in tests — do not
  assert real security guarantees against this value
- **Test data**: Define inline for simple cases; use `tests/fixtures/` for
  objects reused across 3+ tests

## What to Produce

For each new or modified function, generate tests covering:

### 1. Happy Path
- Valid, typical inputs producing the expected output or side effect
- At least one test per distinct success branch

### 2. Edge Cases
- Empty string `""`, `null`, `undefined`, `0`, `-1`, `[]`, `{}`
- Boundary values (min/max lengths, numeric limits)
- Whitespace-only strings where strings are accepted

### 3. Error Cases
- Expected thrown exceptions — use `expect(fn).rejects.toThrow()` for async
- Returned error values or `false` where applicable
- Invalid types passed as arguments

## Async Rules
- Always `await` async functions in tests
- Use `expect(asyncFn()).rejects.toThrow(ErrorClass)` for rejection assertions
- Never use `done` callbacks — use `async/await` exclusively
- Wrap Supertest calls: `await request(app).get('/route').expect(200)`

## Mocking Rules
Mock **only** these categories — never mock internal `src/` logic:
- HTTP calls to external APIs (`axios`, `fetch`, `got`)
- Database queries (`prisma`, `mongoose`, `pg`, `knex`)
- File system operations (`fs`, `path` writes)
- Time-dependent functions (`Date.now`, `setTimeout`)

Use `jest.mock()` at the top of the file; restore with `jest.restoreAllMocks()`
in `afterEach`.

## What NOT to Test
Skip tests for:
- Config files and constants with no logic
- Pure re-exports (`export { x } from './x'`)
- Framework-generated boilerplate (Express app bootstrap, etc.)
- Trivial getters/setters with no transformation logic

## Output Rules
- Use `describe('[functionName]')` blocks, `test('[behaviour description]')`
  inside — not `it()`
- Descriptions state behaviour: `'returns null when input is empty'` not
  `'test empty input'`
- Append to existing test file if one exists for the module; never overwrite
- Run `npm test -- --testPathPattern=<new-test-file>` after writing to
  confirm all new tests pass before declaring done
- Aim for full branch coverage, not just line coverage — every `if/else`
  and `try/catch` branch should have at least one test