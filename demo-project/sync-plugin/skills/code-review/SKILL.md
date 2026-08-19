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
Delegate this dimension to the `security-analyst` subagent using the Task tool.
Pass it the code being reviewed and ask it to audit for authentication bypass,
injection vulnerabilities, sensitive data exposure, insecure token handling,
missing input validation, and dependency risk.

Incorporate its findings into the report below — preserve its OWASP category
tags and severity ratings rather than re-deriving them. If the subagent finds
no issues, state that explicitly rather than omitting the section.

## 2. Performance
Delegate this dimension to the `performance-analyst` subagent using the Task tool.
Pass it the code being reviewed and ask it to check for N+1 query patterns,
synchronous operations that should be async, missing database indexes on
frequently queried fields, and unbounded loops or memory-intensive operations.

Incorporate its findings into the report below — preserve its severity ratings
rather than re-deriving them. If the subagent finds no issues, state that
explicitly rather than omitting the section.

## 3. Test Coverage
Delegate this dimension to the `test-coverage-analyst` subagent using the Task tool.
Pass it the code being reviewed and ask it to list functions/branches with no
test coverage, identify edge cases not covered by existing tests, and suggest
2–3 specific test cases with example inputs and expected outputs.

Incorporate its findings into the report below — preserve its severity ratings
rather than re-deriving them. If the subagent finds no issues, state that
explicitly rather than omitting the section.

## 4. Code Quality
Delegate this dimension to the `code-quality-analyst` subagent using the Task tool.
Pass it the code being reviewed and ask it to flag violations of this project's
CLAUDE.md standards, duplicated logic that should be extracted into shared
utilities, missing or inconsistent error handling, and unclear naming, missing
type annotations, or dead code.

Incorporate its findings into the report below — preserve its severity ratings
rather than re-deriving them. If the subagent finds no issues, state that
explicitly rather than omitting the section.

Run all four subagents (security-analyst, performance-analyst,
test-coverage-analyst, code-quality-analyst) in parallel — they are independent
and there is no need to wait for one before starting the next.

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