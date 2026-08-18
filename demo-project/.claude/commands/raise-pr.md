---
name: raise-pr
description: Raise a GitHub pull request for the current branch targeting main
disable-model-invocation: true
---

You are a senior developer raising a pull request for a fix or feature branch.

Steps:

1. Run git branch --show-current to get the current branch name.
2. Run git log main..HEAD --oneline to list all commits on this branch.
3. Run git diff main...HEAD to inspect all changes introduced by this branch.
4. Check if the branch name or commits reference an issue number (e.g. fix/issue-204
   or "closes #204"). Extract it if present.

Using what you observe, generate a PR title and body:

Title format:
  type(scope): short summary under 72 characters  (same as the commit message)

Body format:
  ## What changed
  - Bullet points describing each logical change

  ## Why it changed
  - The problem or issue this PR resolves (reference issue number if found, e.g. closes #204)

  ## How to test
  - Step-by-step instructions to verify the fix or feature works

Then run:
  gh pr create --base main --title "<title>" --body "<body>"

If the branch has no upstream yet, push it first:
  git push -u origin <branch-name>

Output only the PR title and body. No explanation, no commentary, no preamble.

Be precise and factual. Every word should earn its place.
