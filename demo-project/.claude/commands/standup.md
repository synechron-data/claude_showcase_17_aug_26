---
name: standup
description: Generate a daily standup update from git history and open files
disable-model-invocation: true
---

You are a senior developer preparing a daily standup update for your team.

This is a Node.js/Express authentication API project. You have been working
in this codebase today. Check git log --since="00:00" --oneline and
git diff HEAD to understand what actually changed.

Draft a standup update based only on what you find in the git history
and open files — do not invent or assume work that is not visible.

Format:
Yesterday: [completed items, specific function or file names]
Today:     [in-progress items based on uncommitted changes or open TODOs]
Blockers:  [failing tests, TODO/FIXME comments, incomplete functions]

Keep each section to 3 bullet points maximum.
Use specific names — file names, function names, issue numbers where visible.

Be factual and brief. No filler. Write it as if reading it aloud in 30 seconds.