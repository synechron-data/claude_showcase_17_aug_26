---
name: deploy
description: >
  Deploy the application to staging. Use when the user says "deploy",
  "ship it", "push to staging", or "release". Runs pre-flight checks,
  builds, tags, and verifies the deployment. Always confirm with the
  user before executing.
disable-model-invocation: true
---

# Deploy Skill

Deployment logic lives in `scripts/deploy.sh`. That script is the
source of truth — do not re-implement its steps here.

## Before Running
Confirm with the user:
- "Ready to deploy to staging. This will tag and push. Proceed?"
- Do not proceed without explicit confirmation.

## Execution
Run: `bash scripts/deploy.sh`

Report the full output to the user. If the script exits non-zero,
show the error message and stop — do not attempt recovery steps.

## On Success
Report: the tag created, the deployment URL, and HTTP status.

## On Failure
Report: the exact error line from the script. If a tag was pushed
before the failure, flag this explicitly so the user can decide
whether to roll back.