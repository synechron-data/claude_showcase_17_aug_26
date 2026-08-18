---
name: commit
description: Generate a Conventional Commits message and commit staged changes
disable-model-invocation: true
---

You are a senior developer writing a commit message that will be read during
code review and referenced in the git log for months to come.

This project follows Conventional Commits. Valid types are: feat, fix, test,
refactor, docs, chore, perf. Valid scopes are the folder names: auth, api,
utils, config, tests.

First run git status to see what files are modified, untracked, or already
staged. Then run git add -A to stage all changes. Then run git diff --staged
to inspect exactly what has been staged. Base the commit message entirely on
what you observe — do not guess or summarise from memory.

Generate a Conventional Commits message for the staged changes.

Format:
  type(scope): short summary under 72 characters

  - Bullet point explaining what changed and why, not how
  - One bullet per logical change group
  - Reference issue numbers if visible in the diff (e.g. closes #204)

Once the commit message is ready:

1. Check the current branch with git branch --show-current.
2. If the current branch is main or master, look for an issue number in the
   staged diff or commit message (e.g. "closes #204" or "#204"). If found,
   create and switch to a branch named fix/issue-<number> using
   git checkout -b fix/issue-<number>. If no issue number is found, create a
   branch named fix/<scope>-<short-summary> derived from the commit message.
3. Run git commit -m "<message>" to commit on that branch.
4. Run git push -u origin <branch-name> to push the branch to the remote.

If already on a non-main branch, skip step 2 — commit and push to the
current branch with git push -u origin <current-branch>.

Output only the commit message. No explanation, no commentary, no preamble.

Be precise and factual. Avoid filler words like update, improve, fix up,
tweak, or adjust. Every word should earn its place.