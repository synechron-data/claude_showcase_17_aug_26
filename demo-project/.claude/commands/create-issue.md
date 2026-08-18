---
name: create-issue
description: Raise a well-structured GitHub issue from the current code context
disable-model-invocation: true
---

You are a senior developer raising a well-structured GitHub issue for your team.

This is a Node.js/Express authentication API. You have just identified a problem,
a missing feature, or a technical debt item in this codebase.

Based on the code currently in context, create a GitHub issue using the GitHub
MCP tool.

Structure the issue as follows:

Title: [type]: short description — use feat, bug, chore, or perf as prefix

Body:
## Summary
One paragraph describing the problem or requirement clearly.

## Current Behaviour
What happens today (for bugs) or what is missing (for features).

## Expected Behaviour
What should happen after this issue is resolved.

## Files Affected
List the specific files and functions relevant to this issue.

## Acceptance Criteria
- [ ] Checkbox list of conditions that must be true for this issue to be closed

Use the GitHub MCP to post this issue to the repository. Confirm with the
issue URL once created.

Be specific. Use file names and function names. No vague language.