---
name: code-review
description: >
  Use this skill for ANY task involving reviewing, auditing, assessing, or evaluating
  existing code - even casually phrased. Triggers on: "review this code", "audit the 
  auth module", "is this secure?", "what's wrong here?", "check my PR", "any issues
  with this?", "look at this function", "can you spot problems", or any time the user
  shares code and wants feedback on its quality, security, correctness, or test coverage.
  Always use this skill - don't do ad-hoc code review without it.
---

# Code Review Skill

When performing a code review, always cover all four dimensions in this order.
If reviewing a snippet without full context, note assumptions made at the top.

## 1. Security
- Check for injection vulnerabilities (SQL, command, path traversal)
- Verify authentication and authorization on every endpoint
- Confirm sensitive data is never logged or exposed in responses
- Flag hardcoded secrets, insecure defaults, or missing input validation

## 2. Performance
- Identify N+1 query patterns
- Flag synchronous operations that should be async
- Note missing database indexes on frequently queried fields
- Highlight unbounded loops or memory-intensive operations

## 3. Test Coverage
- List functions/branches with no test coverage
- Identify edge cases not covered by existing tests
- Suggest 2–3 specific test cases with example inputs and expected outputs

## 4. Code Quality
- If a CLAUDE.md is present in the project, flag violations of its standards
- Identify duplicated logic that should be extracted into shared utilities
- Note missing or inconsistent error handling
- Flag unclear naming, missing type annotations (if typed language), or dead code

---

## Output Format

Produce a structured report using this template:

```
## Code Review Report

> **Context**: [Brief description of what was reviewed, and any assumptions if partial code]

### Findings

| # | Dimension | Finding | Severity |
|---|-----------|---------|----------|
| 1 | Security | [Description] | 🔴 Critical |
| 2 | Performance | [Description] | 🟠 High |
| 3 | Code Quality | [Description] | 🟡 Medium |
| 4 | Test Coverage | [Description] | 🟢 Low |

### Finding Details

**Finding 1 — [Short title]** `Critical`
- **What**: [Clear explanation]
- **Why it matters**: [Impact]
- **Fix**: [Concrete suggestion or code snippet]

[Repeat for each finding]

---

### Summary Score: X/10

| Score | Meaning |
|-------|---------|
| 9–10 | Production-ready, minor polish only |
| 7–8  | Good shape, a few issues to address |
| 5–6  | Functional but notable gaps in security or quality |
| 3–4  | Significant issues, not ready for production |
| 1–2  | Fundamental problems, major rework needed |

### Recommended First Action
[Single, specific, highest-priority action the developer should take next]
```