#!/usr/bin/env bash
set -euo pipefail

DEPLOY_URL="${DEPLOY_URL:-https://staging.example.com}"
ALLOWED_BRANCHES="staging main"
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Guard: correct branch
if ! echo "$ALLOWED_BRANCHES" | grep -qw "$BRANCH"; then
  echo "ERROR: Must be on staging or main. Current: $BRANCH" >&2
  exit 1
fi

# Guard: no uncommitted changes in src/
if ! git diff --quiet HEAD -- src/; then
  echo "ERROR: Uncommitted changes in src/" >&2
  exit 1
fi

# Tests
echo "Running tests..."
npm test || { echo "ERROR: Tests failed. Aborting." >&2; exit 1; }

# Build
echo "Building..."
npm run build

# Tag (semver patch increment)
LATEST=$(git tag --list 'v*' --sort=-v:refname | head -n1)
if [[ -z "$LATEST" ]]; then
  NEXT="v0.0.1"
else
  IFS='.' read -r MAJOR MINOR PATCH <<< "${LATEST#v}"
  NEXT="v${MAJOR}.${MINOR}.$((PATCH + 1))"
fi

echo "Tagging $NEXT..."
git tag "$NEXT"
git push origin "$NEXT"

# Health check
echo "Checking $DEPLOY_URL..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL")
if [[ "$STATUS" != "200" ]]; then
  echo "ERROR: Deployment check failed — HTTP $STATUS" >&2
  echo "Tag $NEXT was pushed. Manual rollback may be required." >&2
  exit 1
fi

echo "Deployment complete: $NEXT → $DEPLOY_URL"